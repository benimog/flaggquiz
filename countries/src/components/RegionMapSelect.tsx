import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { regionConfigs, RegionSlug } from "../data/countryRegions";
import SelectGrid from "./SelectGrid";
import { prefetchGeoData } from "./WorldMap";

const regionOrder: RegionSlug[] = [
  "europe",
  "africa",
  "north-america",
  "south-america",
  "asia",
  "oceania",
];

function RegionMapSelect() {
  const navigate = useNavigate();

  // Warm the geo data cache while the user picks a region
  useEffect(() => {
    prefetchGeoData();
  }, []);

  const items = regionOrder.map((slug) => {
    const config = regionConfigs[slug];
    return { key: slug, label: config.nameSwedish, emoji: config.emoji };
  });

  return (
    <SelectGrid
      title="Välj en världsdel"
      subtitle="Spela kartquiz med länder från en specifik världsdel"
      items={items}
      onSelect={(key) => navigate(`/worldmap/${key}`)}
    />
  );
}

export default RegionMapSelect;
