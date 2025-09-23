# 📈 BrokerTEC  

**BrokerTEC** es un entorno educativo para practicar decisiones de compra y venta de acciones en mercados simulados.  
Todo funciona en **USD** y está diseñado para que estudiantes y entusiastas puedan aprender sobre la dinámica bursátil en un entorno seguro.  

---

## 🌐 Descripción general  

- Cada empresa cuenta con **precio de acción (actual e histórico)**, **cantidad de acciones** y **capitalización de mercado**.  
- El inventario lo administra la **Tesorería** (cuenta sistémica). Si no hay acciones disponibles, no se compra.  
- Los usuarios asumen distintos **roles**:  
  - 👨‍💼 **Admin**: gestiona mercados, empresas, precios y usuarios.  
  - 🧑‍💻 **Trader**: opera con un wallet en USD y un límite diario de recarga según su categoría (junior/mid/senior).  
  - 📊 **Analista**: observa reportes y estadísticas por alias (sin PII).  

---

## 🎮 Acciones principales  

- **Trader**  
  - Comprar/Vender acciones al precio actual.  
  - Recargar wallet (respetando límite diario).  
  - Liquidar todo (con confirmación de contraseña).  

- **Admin**  
  - CRUD de Mercados y Empresas.  
  - Cargar y actualizar precios (actuales e históricos).  
  - Gestionar usuarios y categorías (crear, deshabilitar con justificación, delistar empresas).  

- **Analista**  
  - Consultar reportes por empresa y alias.  
  - Visualizar inventario de Tesorería y estadísticas de tenencia.  

---

## 📊 Gráficos permitidos  

1. Precio de la acción vs. tiempo (línea simple).  
2. Top empresas por capitalización (barras horizontales).  
3. Top traders por dinero en wallet y por valor en acciones (barras horizontales).  

---

## 🛠️ Tecnologías  

- **Backend** → Node.js (API REST).  
- **Frontend** → React (interfaz web responsive).  
- **Base de datos** → Microsoft SQL Server.  
- **Gráficos** → librerías open source (línea y barras).  

---

## ⚙️ Ejecución local  

1. Clonar el repositorio:  
   ```bash
   git clone https://github.com/tuusuario/brokertec.git
   cd brokertec
