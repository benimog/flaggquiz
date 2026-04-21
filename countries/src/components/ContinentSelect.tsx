import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SelectGrid from "./SelectGrid";

const continentKeys = [
  { key: "europe", emoji: "\u{1F1EA}\u{1F1FA}" },
  { key: "africa", emoji: "\u{1F30D}" },
  { key: "north-america", emoji: "\u{1F30E}" },
  { key: "south-america", emoji: "\u{1F30E}" },
  { key: "asia", emoji: "\u{1F30F}" },
  { key: "oceania", emoji: "\u{1F3DD}\uFE0F" },
];

function ContinentSelect() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const continents = continentKeys.map(({ key, emoji }) => ({
    key,
    label: t(`continents.${key}`),
    emoji,
  }));

  return (
    <SelectGrid
      title={t("pages.continentSelect.title")}
      subtitle={t("pages.continentSelect.subtitle")}
      items={continents}
      onSelect={(key) => navigate(`/varldsdelar/${key}`)}
    />
  );
}

export default ContinentSelect;
