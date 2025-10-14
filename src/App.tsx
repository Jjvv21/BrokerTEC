import { mockEmpresas } from "./services/mock";

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold underline">Empresas Mock</h1>
      <ul>
        {mockEmpresas.map((e) => (
          <li key={e.id}>
            {e.nombre} - ${e.precioActual}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
