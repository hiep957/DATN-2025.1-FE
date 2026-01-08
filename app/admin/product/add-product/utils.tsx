function ColorOption({ name, code }: { name: string; code: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-4 w-4 rounded-full border"
        style={{ backgroundColor: code }}
      />
      <span>{name}</span>
    </div>
  );
}
export { ColorOption };
