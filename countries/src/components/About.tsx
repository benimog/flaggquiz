import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";

function About() {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Välkommen till flaggquiz.se
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Spellägen
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
            <li>
              <Link component={RouterLink} to="/" color="primary">
                Flaggquiz
              </Link>{" "}
              — Gissa rätt land utifrån flaggan
            </li>
            <li>
              <Link component={RouterLink} to="/write" color="primary">
                Skrivläge
              </Link>{" "}
              — Skriv landets namn själv
            </li>
            <li>
              <Link component={RouterLink} to="/daily" color="primary">
                Daglig
              </Link>{" "}
              — 10 nya flaggor varje dag
            </li>
            <li>
              <Link component={RouterLink} to="/continents" color="primary">
                Världsdel
              </Link>{" "}
              — Flaggquiz per världsdel
            </li>
            <li>
              <Link component={RouterLink} to="/worldmap" color="primary">
                Världskarta
              </Link>{" "}
              — Klicka på rätt land på kartan
            </li>
            <li>
              <Link component={RouterLink} to="/states" color="primary">
                Amerikanska stater
              </Link>{" "}
              — Klicka på rätt stat
            </li>
          </ul>
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tangentbord
        </Typography>
        <Typography variant="body1" gutterBottom>
          Det går att använda tangentbordet för att svara i flaggquiz.
        </Typography>
        <Box sx={{ textAlign: "center", my: 2 }}>
          <img
            src="/numpad.png"
            alt="Använd tangenterna 7, 8, 4, 5"
            style={{ maxWidth: "200px", width: "100%", height: "auto" }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Använd tangenterna 7, 8, 4, 5 enligt bilden
        </Typography>
      </Paper>

      <Box sx={{ textAlign: "center", mt: 4, opacity: 0.7 }}>
        <Typography variant="body2">
          Skapad av{" "}
          <Link
            href="https://erikmartinandersson.se/"
            target="_blank"
            rel="noreferrer"
            color="primary"
          >
            Martin
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default About;
