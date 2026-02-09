import React from "react";
import { useNavigate } from "react-router-dom";
import { regionConfigs, RegionSlug } from "../data/countryRegions";
import SelectGrid from "./SelectGrid";

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
