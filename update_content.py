import sys

# RoutingSection.tsx
with open('frontend/src/components/RoutingSection.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('useState("Calle Marqués de Viana 1, Madrid")', 'useState("Nuevos Ministerios, Madrid")')
content = content.replace('useState("Plaza de Castilla, Madrid")', 'useState("Plaza de Castilla, Madrid")') # unchanged, but just in case
content = content.replace('ruta estándar ~611 m · ruta confort ~806 m · sombra acumulada ×20', 'ruta estándar ~3075 m · ruta confort ~3484 m · sombra acumulada ×10.6')
content = content.replace('Estrecho / Valdeacederas / Plaza de Castilla', 'Tetuán, Chamberí y Fuencarral')

with open('frontend/src/components/RoutingSection.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# README.md
with open('README.md', 'r', encoding='utf-8') as f:
    readme = f.read()

readme = readme.replace('2.112 aristas', '80.794 aristas')
readme = readme.replace('(Tetuán)', '(Tetuán, Chamberí y Fuencarral)')

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(readme)

# anexo_III_memoria.md
with open('anexo_III_memoria.md', 'r', encoding='utf-8') as f:
    anexo = f.read()

anexo = anexo.replace('2.112 aristas', '80.794 aristas')
anexo = anexo.replace('20:00', '20:00') # ensure nothing weird
anexo = anexo.replace('2024', '2024')

with open('anexo_III_memoria.md', 'w', encoding='utf-8') as f:
    f.write(anexo)

print("Files updated successfully.")
