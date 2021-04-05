import React from "react";
import {
  Card,
  SingleSelectField,
  SingleSelectOption,
  SwitchField,
  InputField,
  MultiSelectField,
  MultiSelectOption,
  Button,
} from "@dhis2/ui";
import { SliderPicker } from "react-color";
import { programsQuery } from "../../queries/TEIQueries";
import { useDataQuery } from "@dhis2/app-runtime";
import { FullscreenLoader } from "../helpers/FullscreenLoader";
import i18n from "../../locales";

const TemplatePreview = ({ template }) => {
  const label =
    template.useLabel &&
    template.labelAttributes.length > 0 &&
    template.labelAttributes.map((att) => att.label).join(" | ");

  return (
    <div>
      <div
        className="te-node-preview"
        style={{ backgroundColor: template.color }}
      >
      </div>
      <div className="te-node-preview-label">
        <p>{label || <span>&nbsp;</span>}</p>
      </div>
    </div>
  );
};

export const TrackedEntityTemplateEditor = ({
  template,
  selectedTEs,
  onFieldChanged,
  tes,
  onDelete,
}) => {
  let { loading, data } = useDataQuery(programsQuery);

  if (loading) {
    return <FullscreenLoader />;
  }

  let programById = {};

  data.ps.programs.forEach((pg) => {
    programById[pg.id] = pg;
  });

  const onColorChanged = (color) => {
    onFieldChanged(template.id, "color", color.hex);
  };

  const onNameChanged = (name) => {
    onFieldChanged(template.id, "name", name);
  };

  const onProgramChanged = (selection) => {
    onFieldChanged(template.id, "program", selection.selected);
    onFieldChanged(template.id, "labelAttributes", []);
  };

  const onLabelToggle = (value) => {
    onFieldChanged(template.id, "useLabel", value.checked);
  };

  const onLabelAttributesChanged = (value) => {
    onFieldChanged(template.id, "labelAttributes", value.selected);
  };

  return (
    <Card>
      <div className="te-card">
        <div className="te-card-header">
          <TemplatePreview template={template} />
        </div>
        <div className="te-configs">
          <InputField
            label={i18n.t("Template name")}
            error={!template.name.length}
            onChange={({ value }) => onNameChanged(value)}
            value={template.name}
          />
          <SliderPicker color={template.color} onChange={onColorChanged} />
          <SingleSelectField
            label={i18n.t("Program")}
            selected={template.program}
            error={!template.program}
            onChange={onProgramChanged}
          >
            {data.ps.programs.map((pg) => (
              <SingleSelectOption
                label={pg.displayName}
                value={pg.id}
                key={pg.id}
              />
            ))}
          </SingleSelectField>
          {template.program && (
            <>
              <SwitchField
                label={i18n.t("Show Node Label")}
                checked={template.useLabel}
                onChange={onLabelToggle}
              />
              {template.useLabel ? (
                <div>
                  <MultiSelectField
                    label={i18n.t("Node Label Attributes")}
                    selected={template.labelAttributes}
                    onChange={onLabelAttributesChanged}
                  >
                    {programById[
                      template.program
                    ].programTrackedEntityAttributes.map((tea) => {
                      return (
                        <MultiSelectOption
                          label={tea.trackedEntityAttribute.displayName}
                          value={tea.trackedEntityAttribute.id}
                          key={tea.trackedEntityAttribute.id}
                        />
                      );
                    })}
                  </MultiSelectField>
                </div>
              ) : null}
            </>
          )}
        </div>
        <div className="te-card-footer">
          <Button
            destructive={true}
            onClick={() => {
              onDelete(template.id);
            }}
          >
            {i18n.t("Delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
};
