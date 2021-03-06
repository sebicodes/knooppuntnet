import {Color} from "ol/color";
import {FeatureLike} from "ol/Feature";
import CircleStyle from "ol/style/Circle";
import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import {MapMode} from "../services/map-mode";
import {MapService} from "../services/map.service";
import {MainStyleColors} from "./main-style-colors";
import {NodeStyle} from "./node-style";
import {SurveyDateStyle} from "./survey-date-style";

export class MainMapNodeStyle {

  private readonly largeMinZoomLevel = 13;
  private readonly smallNodeSelectedStyle = this.nodeSelectedStyle(8);
  private readonly largeNodeSelectedStyle = this.nodeSelectedStyle(20);
  private readonly largeNodeStyle = NodeStyle.largeGreen;
  private readonly surveyDateStyle: SurveyDateStyle;

  constructor(private mapService: MapService) {
    this.surveyDateStyle = new SurveyDateStyle(mapService);
  }

  public nodeStyle(zoom: number, feature: FeatureLike): Array<Style> {
    const featureId = feature.get("id");
    const large = zoom >= this.largeMinZoomLevel;
    const selectedStyle = this.determineNodeSelectedStyle(featureId, large);
    const style = this.determineNodeMainStyle(feature, large);
    return selectedStyle ? [selectedStyle, style] : [style];
  }

  private determineNodeSelectedStyle(featureId: string, large: boolean): Style {
    let style = null;
    if (this.mapService.selectedNodeId && featureId && featureId === this.mapService.selectedNodeId) {
      if (large) {
        style = this.largeNodeSelectedStyle;
      } else {
        style = this.smallNodeSelectedStyle;
      }
    }
    return style;
  }

  private determineNodeMainStyle(feature: FeatureLike, large: boolean): Style {
    let style: Style;
    if (large) {
      style = this.determineLargeNodeStyle(feature);
    } else {
      style = this.determineSmallNodeStyle(feature);
    }
    return style;
  }

  private determineLargeNodeStyle(feature: FeatureLike): Style {

    const color = this.nodeColor(feature);

    const circleStyle: CircleStyle = this.largeNodeStyle.getImage() as CircleStyle;

    this.largeNodeStyle.getText().setText(feature.get("name"));
    circleStyle.getStroke().setColor(color);

    if (this.mapService.highlightedNodeId && feature.get("id") === this.mapService.highlightedNodeId) {
      circleStyle.getStroke().setWidth(5);
      circleStyle.setRadius(16);
    } else {
      circleStyle.getStroke().setWidth(3);
      circleStyle.setRadius(14);
    }
    return this.largeNodeStyle;
  }

  private determineSmallNodeStyle(feature: FeatureLike): Style {
    let style = NodeStyle.smallGray;
    if (this.mapService.mapMode === MapMode.surface) {
      style = NodeStyle.smallGreen;
    } else if (this.mapService.mapMode === MapMode.survey) {
      style = this.surveyDateStyle.smallNodeStyle(feature);
    } else if (this.mapService.mapMode === MapMode.analysis) {
      style = this.smallNodeStyleAnalysis(feature);
    }
    return style;
  }

  private nodeSelectedStyle(radius: number): Style {
    return new Style({
      image: new Circle({
        radius: radius,
        fill: new Fill({
          color: MainStyleColors.yellow
        })
      })
    });
  }

  private nodeColor(feature: FeatureLike): Color {
    let color = MainStyleColors.gray;
    if (this.mapService.mapMode === MapMode.surface) {
      color = MainStyleColors.green;
    } else if (this.mapService.mapMode === MapMode.survey) {
      color = this.surveyDateStyle.surveyColor(feature);
    } else if (this.mapService.mapMode === MapMode.analysis) {
      color = this.nodeColorAnalysis(feature);
    }
    return color;
  }

  private nodeColorAnalysis(feature: FeatureLike): Color {
    const layer = feature.get("layer");
    let nodeColor: Color;
    if ("error-node" === layer) {
      nodeColor = MainStyleColors.blue;
    } else if ("orphan-node" === layer) {
      nodeColor = MainStyleColors.darkGreen;
    } else if ("error-orphan-node" === layer) {
      nodeColor = MainStyleColors.darkBlue;
    } else {
      nodeColor = MainStyleColors.green;
    }
    return nodeColor;
  }

  private smallNodeStyleAnalysis(feature: FeatureLike): Style {
    const layer = feature.get("layer");
    let style: Style;
    if ("error-node" === layer) {
      style = NodeStyle.smallBlue;
    } else if ("orphan-node" === layer) {
      style = NodeStyle.smallDarkGreen;
    } else if ("error-orphan-node" === layer) {
      style = NodeStyle.smallDarkBlue;
    } else {
      style = NodeStyle.smallGreen;
    }
    return style;
  }
}
