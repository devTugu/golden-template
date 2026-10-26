"use client";

import { lazy, Suspense, type ComponentProps } from "react";

const LazyChartContainer = lazy(async () => {
  const mod = await import("@default/ui-charts/chart");
  return { default: mod.ChartContainer };
});

export function ChartContainer(
  props: ComponentProps<
    typeof import("@default/ui-charts/chart").ChartContainer
  >,
) {
  return (
    <Suspense fallback={null}>
      <LazyChartContainer {...props} />
    </Suspense>
  );
}
