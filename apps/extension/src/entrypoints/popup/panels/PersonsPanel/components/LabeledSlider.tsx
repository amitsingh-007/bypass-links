import { Slider } from '@bypass/ui';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onValueChange: (value: number) => void;
}

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  disabled,
  onValueChange,
}: Props) {
  return (
    <div className="w-[40%]">
      <span className="mb-2 block text-sm">{label}</span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        thumbAlignment="center"
        onValueChange={(next) => {
          // Base UI: number for single-thumb sliders, array for ranges
          onValueChange((typeof next === 'number' ? next : next[0]) ?? min);
        }}
      />
    </div>
  );
}

export default LabeledSlider;
