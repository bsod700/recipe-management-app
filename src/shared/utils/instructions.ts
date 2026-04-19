const NUMBERED_PREFIX = /^\s*\d{1,2}\s*[-.):]?\s*/;

export function parseInstructionSteps(instructions: string): string[] {
  const lines = instructions
    .split('\n')
    .map((line) => line.replace(NUMBERED_PREFIX, '').trim())
    .filter((line) => line.length > 0);

  return lines.length > 0 ? lines : [''];
}

export function serializeInstructionSteps(steps: ReadonlyArray<string>): string {
  return steps
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .join('\n');
}

export function formatStepNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
