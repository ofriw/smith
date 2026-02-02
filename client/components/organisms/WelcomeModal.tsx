import React from "react";
import { Button, Select, SelectOption } from "../atoms/index.ts";
import { ProviderRow, ProviderRowProps } from "../molecules/index.ts";

export type WelcomeModalProps = {
  providers: ProviderRowProps[];
  modelOptions: SelectOption[];
  selectedModel: string;
  onModelChange: (value: string) => void;
  onGetStarted: () => void;
};

export function WelcomeModal({
  providers,
  modelOptions,
  selectedModel,
  onModelChange,
  onGetStarted,
}: WelcomeModalProps) {
  return (
    <div className="welcome-modal-backdrop">
      <div className="welcome-modal">
        <div className="welcome-modal__header">
          <h1 className="welcome-modal__title">WELCOME TO S.M.I.T.H</h1>
          <p className="welcome-modal__description">
            Structured Multi-model Intelligent Task Handler
          </p>
        </div>

        <div className="welcome-modal__body">
          <p className="welcome-modal__intro">
            S.M.I.T.H connects to AI providers via OAuth or API keys.
            The following providers have been detected:
          </p>

          <div className="welcome-modal__providers">
            {providers.map((provider) => (
              <ProviderRow key={provider.name} {...provider} />
            ))}
          </div>

          <div className="welcome-modal__model-select">
            <label className="welcome-modal__label">Default Model</label>
            <p className="welcome-modal__hint">
              Select the default model to use for workflows. You can change this later.
            </p>
            <Select
              value={selectedModel}
              onChange={onModelChange}
              options={modelOptions}
              placeholder="Select a model..."
              searchable
            />
          </div>
        </div>

        <div className="welcome-modal__footer">
          <Button variant="primary" size="lg" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
