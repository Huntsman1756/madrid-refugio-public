const fs = require('fs');

function applyReplacements(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

applyReplacements('G:/_Proyectos/refugio_madrid/frontend/src/components/RoutingSection.tsx', [
    ['rounded-[28px]', 'rounded-xl'],
    ['rounded-[24px]', 'rounded-xl'],
    ['rounded-[20px]', 'rounded-lg'],
    ['rounded-[18px]', 'rounded-lg'],
    ['rounded-2xl', 'rounded-lg'],
    ['shadow-[0_24px_54px_rgba(31,26,23,0.06)]', 'shadow-md'],
    ['shadow-[0_10px_24px_rgba(31,26,23,0.05)]', 'shadow-sm'],
    ['shadow-[0_14px_32px_rgba(74,124,89,0.06)]', 'shadow-md'],
    ['shadow-[0_28px_64px_rgba(31,26,23,0.10)]', 'shadow-lg'],
    ['shadow-[0_10px_24px_rgba(74,124,89,0.06)]', 'shadow-sm'],
    ['shadow-[0_14px_32px_rgba(230,126,34,0.08)]', 'shadow-md'],
    ['shadow-[0_10px_22px_rgba(31,26,23,0.04)]', 'shadow-sm'],
    ['shadow-[0_10px_18px_rgba(74,124,89,0.08)]', 'shadow-sm'],
    ['shadow-[0_8px_18px_rgba(74,124,89,0.16)]', 'shadow-sm'],
    ['text-xl font-semibold text-[var(--ds-black)]', 'font-display text-2xl font-semibold tracking-tight text-[var(--ds-black)]'],
    ['text-[28px] font-semibold leading-none text-[var(--ds-black)]', 'font-display text-3xl font-semibold leading-none tracking-tight text-[var(--ds-black)]'],
    ['font-serif text-5xl', 'font-display text-5xl'],
    ['bg-[var(--ds-gray-50)]', 'bg-[var(--ds-gray-50)] border border-[var(--ds-gray-200)]'], // map container
]);

applyReplacements('G:/_Proyectos/refugio_madrid/frontend/src/components/SearchBar.tsx', [
    ['rounded-[34px]', 'rounded-xl'],
    ['rounded-[28px]', 'rounded-lg'],
    ['rounded-[24px]', 'rounded-md'],
    ['rounded-2xl', 'rounded-md'],
    ['shadow-[0_20px_52px_rgba(31,26,23,0.06)]', 'shadow-md'],
    ['shadow-[0_6px_16px_rgba(31,26,23,0.04)]', 'shadow-sm'],
    ['shadow-[0_12px_20px_rgba(74,124,89,0.20)]', 'shadow-sm'],
    ['shadow-[0_12px_20px_rgba(74,124,89,0.22)]', 'shadow-sm'],
    ['shadow-[0_18px_32px_rgba(212,140,78,0.26)]', 'shadow-md'],
]);
