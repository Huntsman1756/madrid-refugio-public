import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AlcalaLogo,
  MadridHeatmapMiniArt,
  MadridShelterBuildingArt,
  RouteAdviceVisual,
  RouteHeatVisual,
  RouteResourceVisual,
  TreeBenchArt,
} from "./HomeVisuals";

describe("HomeVisuals", () => {
  it("uses one civic wayfinding visual system for header and route card artwork", () => {
    render(
      <>
        <AlcalaLogo />
        <MadridShelterBuildingArt testId="shelter-art" />
        <MadridHeatmapMiniArt testId="heatmap-art" />
        <TreeBenchArt testId="advice-art" />
        <RouteResourceVisual />
        <RouteHeatVisual />
        <RouteAdviceVisual />
      </>,
    );

    expect(screen.getAllByTestId("civic-wayfinding-system")).toHaveLength(7);
  });
});
