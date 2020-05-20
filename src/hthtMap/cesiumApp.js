import {
  Ion,
  createWorldTerrain,
  Viewer,
  ScreenSpaceEventType,
  SceneMode,
  Cartographic,
  Math as CMath,
  SceneTransforms,
  ScreenSpaceEventHandler,
  ImageryLayer,
  Cartesian3,
  CustomDataSource,
  EllipsoidTerrainProvider,
  WebMercatorTilingScheme,
  Ellipsoid,
  ArcGISTiledElevationTerrainProvider,
  JulianDate,
  ClockRange,
  TimeIntervalCollection,
  TimeInterval,
  VelocityOrientationProperty,
  SampledPositionProperty,
  PolylineGlowMaterialProperty,
  Color,
  HeadingPitchRoll,
  HeadingPitchRange,
  Transforms,
  Model,
  ModelAnimationLoop,
  Matrix4,
} from "cesium";
import { eventEnum } from "./enum/event_enum";
import GoogleLayer from "./layers/baseLayer/googleLayer";
import AMapLayer from "./layers/baseLayer/aMapLayer";
import TdtOnlineCLayer from "./layers/baseLayer/tdtOnlineCLayer";
import TdtOnlineWLayer from "./layers/baseLayer/tdtOnlineWLayer";
import TdtOfflineCLayer from "./layers/baseLayer/tdtOfflineCLayer";
import GISTileLayer from "./layers/baseLayer/gISTileLayer";
import "./style/style.css";
import { mapConfig } from "./config/map_config";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjM2RlYmEzNi1mOTY1LTRjMzQtOTE4Zi1iMjg5NTgyNjk1NDEiLCJpZCI6MjQ0MzgsInNjb3BlcyI6WyJhc2wiLCJhc3IiLCJhc3ciXSwiaWF0IjoxNTg1NTMyMDkwfQ.BVirVWdHLJ8GAeOuKJpE_hcGkIOomXpI0eHUB6_XREQ";

/*
 * mapId:容器id
 * initPostion：初始化位置 [118, 33, 1000000]
 * is3D：是否是3D
 * isFly:是否飞行
 * mapType:底图
 * mapParams:配置参数
 * */
export default class CesiumApp extends Viewer {
  constructor(params) {
    super(params.mapId, {
      sceneMode: params.is3D ? SceneMode.SCENE3D : SceneMode.SCENE2D, // 设定3维地图的默认场景模式:Cesium.SceneMode.SCENE2D、Cesium.SceneMode.SCENE3D、Cesium.SceneMode.MORPHING
      animation: false, // 是否创建动画小器件，左下角仪表
      baseLayerPicker: false, // 是否显示图层选择器
      fullscreenButton: false, // 是否显示全屏按钮
      geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
      homeButton: false, // 是否显示Home按钮
      infoBox: false, // 是否显示信息框
      sceneModePicker: false, // 是否显示3D/2D选择器
      selectionIndicator: false, // 是否显示选取指示器组件
      timeline: false, // 是否显示时间轴
      navigationHelpButton: false, // 是否显示右上角的帮助按钮
      // scene3DOnly: true, // 如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
      navigationInstructionsInitiallyVisible: false,
      showRenderLoopErrors: false, // 是否显示渲染错误
      // 设置背景透明
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
      shouldAnimate: true,
    });

    this.initPostion = params.center;
    this.is3D = params.is3D; // 当前地图是否是3D
    this.initViewer(params.isFly);
    this.initBaseLayer(params.mapType);
    this.allLayers = new Map(); // 除底图外所有图层
    this.handler = new ScreenSpaceEventHandler(this.scene.canvas);
    this.eventObj = {
      [eventEnum.LEFT_CLICK]: new Map(),
      [eventEnum.WHEEL]: new Map(),
    };
    // 启用地球照明
    this.scene.globe.enableLighting = true;
    //设置初始位置
    this.camera.flyTo({
      destination: Cartesian3.fromDegrees(121.48, 31.22, 5001245.0), // 设置位置
      orientation: {
        heading: CMath.toRadians(20.0), // 方向
        pitch: CMath.toRadians(-90.0), // 倾斜角度
        roll: 0,
      },
      duration: 5, // 设置飞行持续时间，默认会根据距离来计算
      complete: function () {
        // 到达位置后执行的回调函数
        console.log("到达目的地");
      },
      cancle: function () {
        // 如果取消飞行则会调用此函数
        console.log("取消定位");
      },
      pitchAdjustHeight: -90, // 如果摄像机飞越高于该值，则调整俯仰俯仰的俯仰角度，并将地球保持在视口中。
      maximumHeight: 5000, // 相机最大飞行高度
      flyOverLongitude: 100, // 如果到达目的地有2种方式，设置具体值后会强制选择方向飞过这个经度
    });
  }

  /**
   * 初始化地图
   */
  initBaseLayer(mapType) {
    let baseLayers = [];
    this.baseLayers = [];
    if (mapType.indexOf("google") !== -1) {
      baseLayers = new GoogleLayer();
    } else if (mapType.indexOf("gaode") !== -1) {
      baseLayers = new AMapLayer();
    } else if (mapType.indexOf("tdt_w") !== -1) {
      baseLayers = new TdtOnlineWLayer();
    } else if (mapType.indexOf("tdt_c") !== -1) {
      baseLayers = new TdtOnlineCLayer();
    } else if (mapType.indexOf("tdt_off") !== -1) {
      baseLayers = new TdtOfflineCLayer(mapConfig.offLineTdtLayers);
    } else if (mapType.indexOf("arcgis") !== -1) {
      baseLayers = new GISTileLayer(mapConfig.arcgisTileLayers);
    }
    this.baseLayers = baseLayers.baseLayers;

    this.imageryLayers.removeAll();
    for (let i = 0; i < this.baseLayers.length; i++) {
      let flag = false; // 是否隐藏
      if (this.baseLayers[i]._credit._html.indexOf(mapType) !== -1) {
        flag = true;
      }
      const layer = new ImageryLayer(this.baseLayers[i], { show: flag });
      this.imageryLayers.add(layer);
    }
  }

  /**
   * 底图切换
   * @param mapType 地图类型
   */
  switchBaseMap(mapType) {
    const imageryLayers = this.imageryLayers._layers;
    for (let i = 0; i < this.baseLayers.length; i++) {
      if (
        imageryLayers[i]._imageryProvider._credit._html.indexOf(mapType) !== -1
      ) {
        imageryLayers[i].show = true;
      } else {
        imageryLayers[i].show = false;
      }
    }
  }

  /**
   * 二三维切换
   * @param type 二三维切换类型
   */
  switchDimension(type) {
    this.is3D ? this.scene.morphTo2D(0) : this.scene.morphTo3D(0);
    this.is3D = !this.is3D;
  }

  /*
   * 恢复
   * isFly:是否飞行
   * */
  initViewer(isFly = false) {
    this.setView(this.initPostion, isFly);
  }

  /*
   * 视角定位
   *postion：位置 [118, 33, 1000000]||[118, 33]
   * isFly:是否飞行
   * */
  setView(postion, isFly = false) {
    if (isFly) {
      this.camera.flyTo({
        destination: Cartesian3.fromDegrees(
          postion[0],
          postion[1],
          postion[2] ? postion[2] : this.camera.positionCartographic.height
        ), // 设置位置
      });
    } else {
      this.camera.setView({
        destination: Cartesian3.fromDegrees(
          postion[0],
          postion[1],
          postion[2] ? postion[2] : this.camera.positionCartographic.height
        ), // 设置位置
      });
    }
  }

  // 放大
  zoomIn() {
    this.camera.zoomIn();
  }

  // 缩小
  zoomOut() {
    this.camera.zoomOut();
  }

  /*
   * 增加Entity
   * */
  addEntity(entity) {
    this.entities.removeById(entity.id);
    this.entities.add(entity);
  }

  /*
   * 改变Entity显隐
   * */
  chanegEntityShow(id) {
    if (this.entities.getById(id)) {
      this.entities.getById(id).show = !this.entities.getById(id).show;
    }
  }

  /*
   * 移除Entity
   * */
  removeEntity(id) {
    this.entities.removeById(id);
  }

  /*
   * 移除所有Entity
   * */
  removeAllEntity(id) {
    this.entities.removeAll();
  }

  /*
   * Cartesian3转屏幕坐标
   * */
  Cartesian3ToPx(scene, Cartesian3) {
    return SceneTransforms.wgs84ToWindowCoordinates(scene, Cartesian3);
  }

  /*
   * 增加DataSource
   * */
  addDataSource(dataSource) {
    this.dataSources.add(dataSource);
  }

  /*
   * 改变DataSource显隐
   * */
  changeDataSourceShow(dataSource) {
    dataSource.show = !dataSource.show;
  }

  /*
   * 移除DataSource
   * */
  removerDataSource(dataSource) {
    this.dataSources.remove(dataSource);
  }

  /*
   * 移除所有DataSource
   * */
  removeAllDataSource() {
    this.dataSources.removeAll();
  }

  /*
   * 地表弧度坐标转地表经纬度
   * */

  // eslint-disable-next-line class-methods-use-this
  cartographicRadiansToCartographicDegrees(cartographicRadians) {
    return {
      longitude: CMath.toDegrees(cartographicRadians.longitude),
      latitude: CMath.toDegrees(cartographicRadians.latitude),
      height: cartographicRadians.height,
    };
  }

  /*
   * 获取当前视野中心
   * */
  getViewCentre() {
    return this.cartographicRadiansToCartographicDegrees(
      this.camera._positionCartographic
    );
  }

  /*
   * 增加事件
   * */
  addEvent(name, type, callback) {
    if (this.eventObj[type].size === 0) {
      switch (type) {
        case eventEnum.LEFT_CLICK:
          this.clickEvent();
          break;
        case eventEnum.WHEEL:
          this.wheelEvent();
          break;
      }
    }
    this.eventObj[type].set(name, {
      enable: true,
      fn: callback,
    });
  }

  /*
   * Cartesian2转Cartesian3
   * */
  Cartesian2ToCartesian3(Cartesian2, is3D) {
    let myCartesian3;
    if (is3D) {
      const ray = this.camera.getPickRay(Cartesian2);
      myCartesian3 = this.scene.globe.pick(ray, this.scene);
    } else {
      myCartesian3 = this.camera.pickEllipsoid(
        Cartesian2,
        this.scene.globe.ellipsoid
      );
    }
    return myCartesian3;
  }

  /*
   * 点击事件
   * */
  clickEvent() {
    this.handler.setInputAction((evt) => {
      if (this.eventObj[eventEnum.LEFT_CLICK].size < 1) {
        return;
      }

      const cartesian = this.Cartesian2ToCartesian3(evt.position, this.is3D);
      if (!cartesian) {
        return;
      }
      const cartographic = Cartographic.fromCartesian(cartesian);
      const mapPosition = this.cartographicRadiansToCartographicDegrees(
        cartographic
      );
      this.eventObj[eventEnum.LEFT_CLICK].forEach((fnObj) => {
        if (fnObj && fnObj.enable) {
          fnObj.fn({
            position: mapPosition,
            pickObj: this.scene.pick(evt.position)
              ? this.scene.pick(evt.position).id[0]
              : false,
          });
        }
      });
    }, ScreenSpaceEventType[eventEnum.LEFT_CLICK]);
  }

  /*
   * 点击滚轮事件
   * */
  wheelEvent() {
    this.handler.setInputAction((evt) => {
      if (this.eventObj[eventEnum.WHEEL].size < 1) {
        return;
      }
      this.eventObj[eventEnum.WHEEL].forEach((fnObj) => {
        if (fnObj && fnObj.enable) {
          fnObj.fn();
        }
      });
    }, ScreenSpaceEventType[eventEnum.WHEEL]);
  }

  /*
   * 改变事件是否可用
   * */
  changeEvent(name, type, enable) {
    if (this.eventObj[type].get(name)) {
      this.eventObj[type].get(name).enable = enable;
    }
  }

  /*
   * 移除监听事件
   * */
  removeEvent(name, type) {
    this.eventObj[type].delete(name);
    if (this.eventObj[type].size === 0) {
      this.handler.removeInputAction(ScreenSpaceEventType[type]);
    }
  }

  /*
   * 增加图层
   * layer：图层
   * */
  addLayer(layer, wmts) {
    if (wmts) {
      let displayLayer = new ImageryLayer(layer.provider, { show: true });
      this.imageryLayers.add(displayLayer);
    } else {
      this.imageryLayers.add(layer);
    }
  }

  /*
   * 改变图层显隐
   * layer：图层
   * */
  changeLayerShow(layer) {
    layer.show = !layer.show;
  }

  /*
   * 移除图层
   * layer：图层
   * */
  removeLayer(layer, wmts) {
    if (wmts) {
      let displayLayer = new ImageryLayer(layer.provider, { show: true });
      this.imageryLayers.remove(displayLayer);
    } else {
      this.imageryLayers.remove(layer);
    }
  }

  /*
   * 移除所有图层
   * */
  removeAllLayer() {
    this.imageryLayers.removeAll();
  }

  /*
   * 增加primitive
   * primitive：primitive
   * */
  addPrimitive(primitive) {
    this.scene.primitives.add(primitive);
  }

  /*
   * 改变Primitive显隐
   * primitive：primitive
   * */
  changePrimitiveShow(primitive) {
    primitive.show = !primitive.primitive;
  }

  /*
   * 移除Primitive
   * primitive：primitive
   * */
  removePrimitive(primitive) {
    this.scene.primitives.remove(primitive);
  }

  /*
   * 移除所有Primitive
   * 慎用
   * */
  removeAllPrimitive() {
    this.scene.primitives.removeAll();
  }

  addTerrain(type) {
    // switch (type) {
    //   case 'ION':
    //     // 加载在线地形图数据
    //     const worldTerrain = createWorldTerrain({
    //       requestWaterMask: true,
    //       requestVertexNormals: true,
    //     })
    //     this.terrainProvider = worldTerrain
    //     break
    //   case 'STK':
    //     // 加载在线地形图数据
    //     const stkTerrain = EllipsoidTerrainProvider({
    //       tilingScheme: new WebMercatorTilingScheme({ ellipsoid: Ellipsoid.WGS84 }),
    //     })
    //     this.terrainProvider = stkTerrain
    //     break
    //   case 'ARCGIS':
    //     // 加载在线地形图数据
    //     const arcgisTerrain = new ArcGISTiledElevationTerrainProvider({
    //       url:
    //         'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
    //       token: Ion.defaultAccessToken,
    //     })
    //     this.terrainProvider = arcgisTerrain
    //     break
    //   default:
    //     break
    // }
  }

  drawLine() {
    var cesiumdiv = document.getElementById("cesium-map");
    var lineStatus = false;
    cesiumdiv.style.cursor = "crosshair";
    var redLine;
    var handler = new ScreenSpaceEventHandler(this.scene.canvas);
    handler.setInputAction(function (event) {
      //event position: a {x: 510, y: 345} 屏幕坐标
      if (!lineStatus) {
        return;
      }
      handlerlineStatus = true;

      //屏幕坐标转
      var ray = viewer.camera.getPickRay(event.position);
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      //将笛卡尔坐标转换为地理坐标
      var cartographic = Cartographic.fromCartesian(cartesian);
      //将弧度转为度的十进制度表示
      var log = CMath.toDegrees(cartographic.longitude);
      var lat = CMath.toDegrees(cartographic.latitude);
      // 获取海拔高度
      var height1 = viewer.scene.globe.getHeight(cartographic);
      var height2 = cartographic.height;
      positions.push(cartesian);
      //添加实体
      // var en = viewer.entities.add({
      //     id:arr[arr.length-1],
      //     name:"点击",
      //     description:"cjgfjb",
      //     position:cartesian,
      //     billboard:{
      //         image: './img/default1.png',
      //         width:100,
      //         height:100
      //     }
      // })

      console.log(redLine.polyline.positions);
      if (positions.length > 1) {
        redLine.polyline.positions = positions; //更新线的点
        // viewer.entities.add(redLine);
      }

      arr.push(arr.length);
    }, ScreenSpaceEventType.LEFT_CLICK);
  }
  flyTest() {
    // 数据
    let data = [];
    data[0] = [
      { longitude: 116.492339, dimension: 39.980411, height: 0, time: 0 },
      { longitude: 101.909418, dimension: 39.649198, height: 0, time: 40 },
      { longitude: 114.272402, dimension: 25.575537, height: 0, time: 100 },
      { longitude: 85.572619, dimension: 40.046271, height: 0, time: 280 },
      { longitude: 128.695882, dimension: 47.197037, height: 0, time: 360 },
    ];
    // 起始时间
    let start = JulianDate.fromDate(new Date(2015, 6, 27));
    // 结束时间
    let stop = JulianDate.addSeconds(start, 360, new JulianDate());
    //console.log(new Cesium.JulianDate());
    // 设置始时钟始时间
    this.clock.startTime = start.clone();
    // 设置时钟当前时间
    this.clock.currentTime = start.clone();
    // 设置始终停止时间
    this.clock.stopTime = stop.clone();
    // 时间速率，数字越大时间过的越快
    this.clock.multiplier = 2;
    console.log("开始时间:" + start + "-----结束时间:" + stop);
    //给时间线设置边界
    //viewer.timeline.zoomTo(start, stop);
    // 循环执行
    this.clock.clockRange = ClockRange.LOOP_STOP;
    for (let j = 0; j < data.length; j++) {
      let property = this.computeFlight(data[j]);
      // 添加模型
      let entity = this.entities.add({
        // 和时间轴关联
        availability: new TimeIntervalCollection([
          new TimeInterval({
            start: start,
            stop: stop,
          }),
        ]),
        position: property,
        //基于位置移动自动计算方向.
        orientation: new VelocityOrientationProperty(property),
        // 模型数据
        model: {
          uri: "./data/Cesium_Air.glb",
          // uri: urlMoXi + 'img/Cesium_Air.glb',
          minimumPixelSize: 128,
        },
        //路径
        path: {
          resolution: 1,
          material: new PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Color.PINK,
          }),
          width: 10,
        },
      });
    }
  }
  /**
   * 计算飞行
   * @param source 数据坐标
   * @returns {SampledPositionProperty|*}
   */
  computeFlight(source) {
    // 取样位置 相当于一个集合
    let start = JulianDate.fromDate(new Date(2015, 6, 27));
    let property = new SampledPositionProperty();
    for (let i = 0; i < source.length; i++) {
      let time = JulianDate.addSeconds(start, source[i].time, new JulianDate());
      let position = Cartesian3.fromDegrees(
        source[i].longitude,
        source[i].dimension,
        source[i].height
      );
      // 添加位置，和时间对应
      property.addSample(time, position);
    }
    return property;
  }
}
