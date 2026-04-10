"use client";

import { useState } from "react";
import { Button } from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";

export function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      size="small"
      icon={copied ? <CheckOutlined style={{ color: "#0d9488" }} /> : <CopyOutlined />}
      onClick={handleCopy}
      style={{ fontSize: 12 }}
    >
      {copied ? "Copiado" : label}
    </Button>
  );
}
