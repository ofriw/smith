import React from "react";
import { createRoot } from "react-dom/client";
import { registerSchemas } from "@smith/common";
import { AppShell } from "./AppShell.tsx";

registerSchemas();

const root = createRoot(document.getElementById("root")!);
root.render(<AppShell />);
