import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

interface ContinentOption {
    name: string;
    nameSwedish: string;
    emoji: string;
    apiName: string;
}

const continents: ContinentOption[] = [
    { name: "Africa", nameSwedish: "Afrika", emoji: "🌍", apiName: "africa" },
    { name: "Americas", nameSwedish: "Amerika", emoji: "🌎", apiName: "americas" },
    { name: "Asia", nameSwedish: "Asien", emoji: "🌏", apiName: "asia" },
    { name: "Europe", nameSwedish: "Europa", emoji: "🇪🇺", apiName: "europe" },
    { name: "Oceania", nameSwedish: "Oceanien", emoji: "🏝️", apiName: "oceania" },
];

function ContinentSelect() {
    const navigate = useNavigate();

    const handleContinentSelect = (apiName: string) => {
        navigate(`/continents/${apiName}`);
    };

    return (
        <div>
            <h2>Välj en världsdel</h2>
            <p>Spela flaggquiz med länder från en specifik världsdel</p>
            <Stack spacing={2} sx={{ marginTop: "2rem", alignItems: "center" }}>
                {continents.map((continent) => (
                    <Button
                        variant="contained"
                        key={continent.apiName}
                        onClick={() => handleContinentSelect(continent.apiName)}
                        sx={{
                            width: "250px",
                            fontSize: "1.1rem",
                            padding: "12px 24px",
                        }}
                    >
                        <span className="emoji" style={{ marginRight: "8px" }}>
                            {continent.emoji}
                        </span>
                        {continent.nameSwedish}
                    </Button>
                ))}
            </Stack>
        </div>
    );
}

export default ContinentSelect;
