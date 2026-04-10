export default function JesterHat({ size = 80 }: { size?: number }) {
  return (
    <img
      src="/joker-hat.png"
      alt="Planning Poker"
      style={{ width: size, height: size }}
      className="object-contain drop-shadow-lg"
    />
  );
}
