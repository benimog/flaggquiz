import React from "react";
import { useNavigate } from "react-router-dom";
import SelectGrid from "./SelectGrid";

const continents = [
  { key: "europe", label: "Europa", emoji: "\u{1F1EA}\u{1F1FA}" },
  { key: "africa", label: "Afrika", emoji: "\u{1F30D}" },
  { key: "americas", label: "Amerika", emoji: "\u{1F30E}" },
  { key: "asia", label: "Asien", emoji: "\u{1F30F}" },
  { key: "oceania", label: "Oceanien", emoji: "\u{1F3DD}\uFE0F" },
];

function ContinentSelect() {
  const navigate = useNavigate();

  return (
    <SelectGrid
      title="Välj en världsdel"
      subtitle="Spela flaggquiz med länder från en specifik världsdel"
      items={continents}
      onSelect={(key) => navigate(`/continents/${key}`)}
    />
  );
}

export default ContinentSelect;
