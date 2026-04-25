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
  it("renders each component with a unique functional testId", () => {
    render(
      <>
        <AlcalaLogo testId="my-logo" />
        <MadridShelterBuildingArt testId="my-shelter" />
        <MadridHeatmapMiniArt testId="my-heatmap" />
        <TreeBenchArt testId="my-advice" />
        <RouteResourceVisual testId="my-resource" />
        <RouteHeatVisual testId="my-heat" />
        <RouteAdviceVisual testId="my-advice-custom" />
      </>,
    );

    expect(screen.getByTestId("my-logo")).toBeInTheDocument();
    expect(screen.getByTestId("my-shelter")).toBeInTheDocument();
    expect(screen.getByTestId("my-heatmap")).toBeInTheDocument();
    expect(screen.getByTestId("my-advice")).toBeInTheDocument();
    expect(screen.getByTestId("my-resource")).toBeInTheDocument();
    expect(screen.getByTestId("my-heat")).toBeInTheDocument();
    expect(screen.getByTestId("my-advice-custom")).toBeInTheDocument();
  });
});
