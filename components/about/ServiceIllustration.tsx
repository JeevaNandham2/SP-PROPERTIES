type ServiceKind = "flat-developers" | "building-contractor" | "interior-services" | "joint-venture";
type Material = "paper" | "navy" | "gold" | "stone";
type Point = [number, number, number];

const materials: Record<Material, { light: string; top: string; front: string; side: string }> = {
  paper: { light: "#ffffff", top: "#eee8dc", front: "#eee6d6", side: "#c9c1b2" },
  navy: { light: "#617697", top: "#1e2f5b", front: "#2c426a", side: "#152644" },
  gold: { light: "#ffe8a6", top: "#f9bf2c", front: "#e4ac25", side: "#bd861d" },
  stone: { light: "#faf6ec", top: "#e4dccb", front: "#d3c9b7", side: "#b8ae9d" },
};

function project([x, y, z]: Point) { return `${120 + x - y},${70 + (x + y) * .5 - z}`; }

function Surface({ points, fill, stroke, strokeWidth = 1 }: { points: Point[]; fill: string; stroke?: string; strokeWidth?: number }) {
  return <polygon points={points.map(project).join(" ")} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />;
}

function Block({ x, y, z = 0, w, d, h, material = "paper", id }: {
  x: number; y: number; z?: number; w: number; d: number; h: number; material?: Material; id: string;
}) {
  const palette = materials[material];
  return <g>
    <Surface points={[[x + w,y,z],[x + w,y + d,z],[x + w,y + d,z + h],[x + w,y,z + h]]} fill={palette.side} />
    <Surface points={[[x,y + d,z],[x + w,y + d,z],[x + w,y + d,z + h],[x,y + d,z + h]]} fill={palette.front} />
    <Surface points={[[x,y,z + h],[x + w,y,z + h],[x + w,y + d,z + h],[x,y + d,z + h]]} fill={`url(#${id}-${material})`} />
  </g>;
}

function Model({ kind, id }: { kind: ServiceKind; id: string }) {
  switch (kind) {
    case "flat-developers": return <>
      <Block id={id} x={15} y={16} z={6} w={61} d={44} h={55} />
      {[19,39].flatMap((z) => [23,40,57].map((x) => <g key={`${x}-${z}`}>
        <Surface points={[[x,60,z],[x + 10,60,z],[x + 10,60,z + 13],[x,60,z + 13]]} fill={`url(#${id}-navy)`} />
        <Surface points={[[x + 1,60.1,z + 11],[x + 9,60.1,z + 11],[x + 9,60.1,z + 12],[x + 1,60.1,z + 12]]} fill="#8e9eb6" />
      </g>))}
      {[20,40].flatMap((z) => [24,43].map((y) => <Surface key={`${y}-${z}`} points={[[76,y,z],[76,y + 9,z],[76,y + 9,z + 12],[76,y,z + 12]]} fill="#1e2f5b" />))}
      <Block id={id} x={13} y={58} z={33} w={65} d={8} h={2} material="gold" />
      <Surface points={[[16,66,36],[75,66,36],[75,66,41],[16,66,41]]} fill="none" stroke="#2b3c5a" strokeWidth={.7} />
      <Block id={id} x={12} y={13} z={61} w={67} d={50} h={4} material="gold" />
      <Block id={id} x={25} y={24} z={65} w={39} d={24} h={3} material="paper" />
      <Block id={id} x={14} y={64} z={6} w={66} d={9} h={2} material="stone" />
    </>;
    case "building-contractor": return <>
      <Block id={id} x={18} y={22} z={6} w={58} d={44} h={34} />
      <Surface points={[[27,66,6],[39,66,6],[39,66,31],[27,66,31]]} fill={`url(#${id}-navy)`} />
      <Surface points={[[49,66,18],[68,66,18],[68,66,31],[49,66,31]]} fill={`url(#${id}-navy)`} />
      <Surface points={[[76,32,16],[76,53,16],[76,53,31],[76,32,31]]} fill="#1e2f5b" />
      <Surface points={[[58,66.1,18],[59,66.1,18],[59,66.1,31],[58,66.1,31]]} fill="#f4d58a" />
      <Surface points={[[36,66.1,17],[37,66.1,17],[37,66.1,21],[36,66.1,21]]} fill="#f9bf2c" />
      <Block id={id} x={15} y={19} z={40} w={64} d={50} h={4} material="navy" />
      <Block id={id} x={22} y={25} z={44} w={38} d={28} h={5} material="gold" />
      <Block id={id} x={22} y={66} z={6} w={22} d={9} h={3} material="stone" />
      <Block id={id} x={47} y={70} z={6} w={30} d={3} h={3} material="gold" />
      <Block id={id} x={78} y={27} z={6} w={3} d={43} h={3} material="gold" />
      <Surface points={[[11,14,4],[87,14,4],[87,75,4]]} fill="none" stroke="#a48b55" strokeWidth={.6} />
    </>;
    case "interior-services": return <>
      <Block id={id} x={8} y={8} z={6} w={4} d={64} h={51} />
      <Block id={id} x={12} y={8} z={6} w={68} d={4} h={51} material="navy" />
      <Surface points={[[27,12,31],[51,12,31],[51,12,49],[27,12,49]]} fill="#fff8e8" stroke="#e3bd65" strokeWidth={1.5} />
      <Surface points={[[32,12.1,34],[46,12.1,34],[46,12.1,45],[38,12.1,39]]} fill="#f9bf2c" />
      <Surface points={[[22,47,6.1],[75,47,6.1],[75,73,6.1],[22,73,6.1]]} fill="#d1c0a2" />
      <Block id={id} x={23} y={20} z={9} w={52} d={23} h={11} material="navy" />
      <Block id={id} x={23} y={18} z={14} w={52} d={5} h={19} material="navy" />
      <Block id={id} x={23} y={21} z={10} w={5} d={25} h={18} material="navy" />
      <Block id={id} x={70} y={21} z={10} w={5} d={25} h={18} material="navy" />
      <Block id={id} x={29} y={25} z={20} w={19} d={16} h={4} material="paper" />
      <Block id={id} x={50} y={25} z={20} w={19} d={16} h={4} material="gold" />
      <Block id={id} x={36} y={55} z={6} w={4} d={4} h={9} material="navy" />
      <Block id={id} x={56} y={65} z={6} w={4} d={4} h={9} material="navy" />
      <Block id={id} x={32} y={51} z={15} w={32} d={21} h={3} material="gold" />
      <Block id={id} x={43} y={56} z={18} w={11} d={9} h={1.5} />
    </>;
    case "joint-venture": return <>
      <Block id={id} x={13} y={19} z={6} w={25} d={48} h={15} material="gold" />
      <Block id={id} x={38} y={47} z={6} w={30} d={20} h={15} material="gold" />
      <Block id={id} x={43} y={13} z={6} w={38} d={23} h={18} material="navy" />
      <Block id={id} x={67} y={36} z={6} w={14} d={32} h={18} material="navy" />
      <Block id={id} x={32} y={23} z={27} w={29} d={35} h={2} />
      <Surface points={[[38,30,29.1],[55,30,29.1],[55,32,29.1],[38,32,29.1]]} fill="#1e2f5b" />
      <Surface points={[[38,36,29.1],[51,36,29.1],[51,37,29.1],[38,37,29.1]]} fill="#a3adbc" />
      <Surface points={[[38,40,29.1],[53,40,29.1],[53,41,29.1],[38,41,29.1]]} fill="#a3adbc" />
      <polyline points={[[41,48,29.2],[45,52,29.2],[53,45,29.2]].map((point) => project(point as Point)).join(" ")} fill="none" stroke="#bd861d" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Surface points={[[17,74,5],[82,74,5]]} fill="none" stroke="#b3985c" strokeWidth={.7} />
    </>;
  }
}

/** Small architectural models: server-rendered vectors, no canvas or animation loop. */
export function ServiceIllustration({ kind }: { kind: ServiceKind }) {
  const id = `about-model-${kind}`;
  return <div className="about-service-visual" aria-hidden="true">
    <svg className="about-service-art" viewBox="0 0 240 190" fill="none" focusable="false">
      <defs>
        {Object.entries(materials).map(([name,palette]) => <linearGradient key={name} id={`${id}-${name}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={palette.light} /><stop offset="1" stopColor={palette.top} /></linearGradient>)}
        <radialGradient id={`${id}-shadow`}><stop stopColor="#1e2f5b" stopOpacity=".16" /><stop offset="1" stopColor="#1e2f5b" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="about-model-shadow" cx="128" cy="158" rx="91" ry="27" fill={`url(#${id}-shadow)`} />
      <g className="about-service-model">
        <Block id={id} x={0} y={0} w={90} d={78} h={6} material="stone" />
        <Surface points={[[6,7,6.1],[83,7,6.1],[83,71,6.1],[6,71,6.1]]} fill="none" stroke="#ffffff" strokeWidth={.65} />
        <Model kind={kind} id={id} />
      </g>
    </svg>
  </div>;
}
