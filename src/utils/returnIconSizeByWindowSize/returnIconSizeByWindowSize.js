export default function returnIconSizeByWindowSize() {
  if (window.innerWidth <= 479) { return 18; }
  else if (window.innerWidth <= 768) { return 22; }
  return 25;
}
