import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { regionConfigs, getRegionDisplayName, RegionSlug } from "../data/countryRegions";
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
  const { t, i18n } = useTranslation();

  // Warm the geo data cache while the user picks a region
  useEffect(() => {
    prefetchGeoData();
  }, []);

  const items = regionOrder.map((slug) => {
    const config = regionConfigs[slug];
    return { key: slug, label: getRegionDisplayName(slug, i18n.language), emoji: config.emoji };
  });

  return (
    <SelectGrid
      title={t("pages.regionMapSelect.title")}
      subtitle={t("pages.regionMapSelect.subtitle")}
      items={items}
      onSelect={(key) => navigate(`/varldskarta/${key}`)}
    />
  );
}

export default RegionMapSelect;
