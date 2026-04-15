import { createRef, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SearchOption } from "@/lib/madrid-search";

import { AddressAutocompleteField } from "./AddressAutocompleteField";

const OPTIONS: SearchOption[] = [
  {
    id: "addr-1",
    label: "Calle de Atocha 27, Madrid",
    kind: "address",
    lat: 40.4132,
    lon: -3.7001,
  },
  {
    id: "place-1",
    label: "Ciudad Universitaria, Madrid",
    kind: "place",
    lat: 40.4436,
    lon: -3.7263,
  },
  {
    id: "area-1",
    label: "Ciudad de los Angeles, Madrid",
    kind: "area",
    lat: 40.3634,
    lon: -3.689,
  },
];

describe("AddressAutocompleteField", () => {
  it("shows filtered suggestions with kind labels and emits the selected option", () => {
    const onSelect = vi.fn();

    render(
      <AddressAutocompleteField
        label="Destino"
        name="destination"
        options={OPTIONS}
        placeholder="Busca una direccion"
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByLabelText("Destino"), {
      target: { value: "ci" },
    });

    expect(screen.getByRole("button", { name: /ciudad de los angeles, madrid/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ciudad universitaria, madrid/i })).toBeInTheDocument();
    expect(screen.getByText("Area")).toBeInTheDocument();
    expect(screen.getByText("Lugar")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /ciudad universitaria, madrid/i }));

    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
    expect(screen.getByDisplayValue("Ciudad Universitaria, Madrid")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ciudad de los angeles, madrid/i })).not.toBeInTheDocument();
  });

  it("supports a controlled query value and external sync", () => {
    const onSelect = vi.fn();

    function ControlledField() {
      const [value, setValue] = useState("Ca");
      const [selectedOption, setSelectedOption] = useState<SearchOption | null>(null);

      return (
        <>
          <AddressAutocompleteField
            label="Destino"
            name="destination"
            options={OPTIONS}
            value={value}
            selectedOption={selectedOption}
            onValueChange={setValue}
            onSelect={(option) => {
              setSelectedOption(option);
              onSelect(option);
            }}
          />
          <button type="button" onClick={() => setValue("Ciudad")}>Sincronizar</button>
        </>
      );
    }

    render(<ControlledField />);

    const input = screen.getByRole("combobox", { name: "Destino" });
    expect(input).toHaveValue("Ca");

    fireEvent.change(input, { target: { value: "Calle" } });
    expect(input).toHaveValue("Calle");

    fireEvent.click(screen.getByRole("button", { name: "Sincronizar" }));
    expect(input).toHaveValue("Ciudad");
  });

  it("supports keyboard navigation and selection", () => {
    const onSelect = vi.fn();

    render(
      <AddressAutocompleteField
        label="Destino"
        name="destination"
        options={OPTIONS}
        onSelect={onSelect}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Destino" });

    fireEvent.change(input, { target: { value: "ci" } });

    expect(input).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(OPTIONS[2]);
    expect(input).toHaveValue("Ciudad de los Angeles, Madrid");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("dismisses suggestions on escape, blur, and outside pointer events", () => {
    const onSelect = vi.fn();
    const ref = createRef<HTMLInputElement>();

    render(
      <>
        <AddressAutocompleteField
          ref={ref}
          label="Destino"
          name="destination"
          options={OPTIONS}
          onSelect={onSelect}
        />
        <button type="button">Outside</button>
      </>,
    );

    const input = screen.getByRole("combobox", { name: "Destino" });

    expect(ref.current).toBe(input);

    fireEvent.change(input, { target: { value: "ci" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "ci" } });
    fireEvent.blur(input, { relatedTarget: screen.getByRole("button", { name: "Outside" }) });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "ci" } });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
