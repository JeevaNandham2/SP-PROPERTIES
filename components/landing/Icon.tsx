import { ArrowLeft, ArrowRight, Mail, MapPin, Phone, type LucideProps } from "lucide-react";

const icons = { arrow: ArrowRight, arrowLeft: ArrowLeft, pin: MapPin, phone: Phone, mail: Mail };

export function Icon({ name, ...props }: LucideProps & { name: keyof typeof icons }) {
  const Component = icons[name];
  return <Component size={18} strokeWidth={1.7} aria-hidden="true" {...props} />;
}
