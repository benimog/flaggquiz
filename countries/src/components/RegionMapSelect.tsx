import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { regionConfigs, RegionSlug } from "../data/countryRegions";

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

    return (
        <div>
            <h2>Välj en världsdel</h2>
            <p>Spela kartquiz med länder från en specifik världsdel</p>
            <Stack spacing={2} sx={{ marginTop: "2rem", alignItems: "center" }}>
                {regionOrder.map((slug) => {
                    const config = regionConfigs[slug];
                    return (
                        <Button
                            variant="contained"
                            key={slug}
                            onClick={() => navigate(`/worldmap/${slug}`)}
                            sx={{
                                width: "250px",
                                fontSize: "1.1rem",
                                padding: "12px 24px",
                            }}
                        >
                            <span className="emoji" style={{ marginRight: "8px" }}>
                                {config.emoji}
                            </span>
                            {config.nameSwedish}
                        </Button>
                    );
                })}
            </Stack>
        </div>
    );
}

export default RegionMapSelect;
