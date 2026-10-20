"use client"

import { useState, type FormEvent } from "react"

type FormularioTarifa = {
  tipo: string
  paginas: string
  formulario: string
  segundoIdioma: string
}

type Presupuesto = {
  tipo: string
  paginas: number
  formulario: boolean
  segundoIdioma: boolean
  precioBase: number
  cantidadPaginasAdicionales: number
  precioPorPaginaAdicional: number
  costePaginasAdicionales: number
  extrasSeleccionados: { nombre: string; precio: number }[]
  total: number
}

type Tarifas = {
  Landing: string
  "Web-corporativa": string
  "Pagina-adicional-a-primera": string
  "Formulario-contacto": string
  "Segundo-idioma": string
}

const camposIniciales: FormularioTarifa = {
  tipo: "",
  paginas: "",
  formulario: "",
  segundoIdioma: "",
}

const pruebas = [
  {
    nombre: "Landing, 1 página, sin extras",
    entrada: 'tipo: landing, páginas: 1, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 200 — total: 300 €",
  },
  {
    nombre: "Corporativa, 4 páginas, con formulario",
    entrada: 'tipo: corporativa, páginas: 4, formulario: "true", segundo idioma: "false"',
    resultado: "HTTP 200 — total: 830 €",
  },
  {
    nombre: "Landing, 2 páginas, ambos extras",
    entrada: 'tipo: landing, páginas: 2, formulario: "true", segundo idioma: "true"',
    resultado: "HTTP 200 — total: 580 €",
  },
  {
    nombre: "Landing, 20 páginas, sin extras",
    entrada: 'tipo: landing, páginas: 20, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 200 — total: 1250 €",
  },
  {
    nombre: "Cero páginas",
    entrada: 'tipo: landing, páginas: 0, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 400",
  },
  {
    nombre: "Más de 20 páginas",
    entrada: 'tipo: landing, páginas: 21, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 400",
  },
  {
    nombre: "Páginas fraccionarias",
    entrada: 'tipo: landing, páginas: 2.5, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 400",
  },
  {
    nombre: "Tipo no admitido",
    entrada: 'tipo: tienda, páginas: 1, formulario: "false", segundo idioma: "false"',
    resultado: "HTTP 400",
  },
  {
    nombre: "Formulario como booleano",
    entrada: 'tipo: landing, páginas: 1, formulario: false, segundo idioma: "false"',
    resultado: "HTTP 400",
  },
]

export default function Page() {
  const [campos, setCampos] = useState(camposIniciales)
  const [tarifa, setTarifa] = useState<number | null>(null)
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null)
  const [tarifas, setTarifas] = useState<Tarifas | null>(null)
  const [mensaje, setMensaje] = useState("")
  const [consultando, setConsultando] = useState(false)

  async function consultarTarifa(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setTarifa(null)
    setPresupuesto(null)
    setTarifas(null)
    setMensaje("")

    setConsultando(true)

    try {
      const respuestaEstado = await fetch("/api/estado")
      if (!respuestaEstado.ok) {
        throw new Error("No se ha podido comprobar el estado de la API.")
      }

      const estado: { status: string } = await respuestaEstado.json()
      if (estado.status !== "ok") {
        setMensaje("La API no está disponible en este momento.")
        return
      }

      const respuestaTarifa = await fetch("/api/tarifas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: campos.tipo,
          paginas: campos.paginas,
          formulario: campos.formulario,
          segundoIdioma: campos.segundoIdioma,
        }),
      })
      const resultado: {
        total?: number
        presupuesto?: Presupuesto
        tarifas?: Tarifas
        error?: string
      } = await respuestaTarifa.json()

      if (
        !respuestaTarifa.ok ||
        resultado.total === undefined ||
        resultado.presupuesto === undefined ||
        resultado.tarifas === undefined
      ) {
        throw new Error(resultado.error ?? "No se ha podido calcular la tarifa.")
      }

      setTarifa(resultado.total)
      setPresupuesto(resultado.presupuesto)
      setTarifas(resultado.tarifas)
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "Se ha producido un error al consultar la API."
      )
    } finally {
      setConsultando(false)
    }
  }

  return (
    <main className="flex min-h-svh w-full items-start justify-center p-0">
      <section className="w-full max-w-none space-y-8">
        <section className="relative isolate overflow-hidden border-b border-indigo-200 shadow-sm">
          <video
            aria-hidden="true"
            autoPlay
            className="absolute inset-0 -z-10 size-full object-cover"
            loop
            muted
            playsInline
          >
            <source src="/videos/7308093-hd_1920_1080_24fps.mp4" type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/70" />
          <div className="relative z-10 space-y-8 p-6 sm:p-10">
          <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-800">Calcula la tarifa de tu web</h1>
          <p className="text-base text-slate-600">
            Indica las características de la página para consultar su precio.
          </p>
        </div>

        <div className="m-[20px] rounded-2xl bg-green-950 p-[20px]">
        <form className="space-y-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm sm:p-8" onSubmit={consultarTarifa}>
          <div className="m-[10px]">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-lg font-semibold text-slate-700">
              Tipo
              <input
                className="w-full rounded-lg border-2 border-slate-300 bg-white p-4 text-lg text-slate-900 outline-none transition-all duration-200 ease-in-out focus:scale-[1.02] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="text"
                value={campos.tipo}
                onChange={(evento) =>
                  setCampos({ ...campos, tipo: evento.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-lg font-semibold text-slate-700">
              Páginas
              <input
                className="w-full rounded-lg border-2 border-slate-300 bg-white p-4 text-lg text-slate-900 outline-none transition-all duration-200 ease-in-out focus:scale-[1.02] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="text"
                value={campos.paginas}
                onChange={(evento) =>
                  setCampos({ ...campos, paginas: evento.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-lg font-semibold text-slate-700">
              Formulario
              <input
                className="w-full rounded-lg border-2 border-slate-300 bg-white p-4 text-lg text-slate-900 outline-none transition-all duration-200 ease-in-out focus:scale-[1.02] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="text"
                value={campos.formulario}
                onChange={(evento) =>
                  setCampos({ ...campos, formulario: evento.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-2 text-lg font-semibold text-slate-700">
              Segundo idioma
              <input
                className="w-full rounded-lg border-2 border-slate-300 bg-white p-4 text-lg text-slate-900 outline-none transition-all duration-200 ease-in-out focus:scale-[1.02] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                type="text"
                value={campos.segundoIdioma}
                onChange={(evento) =>
                  setCampos({ ...campos, segundoIdioma: evento.target.value })
                }
              />
            </label>
          </div>
          </div>

          <div className="flex justify-end">
            <button
              className="rounded-lg bg-indigo-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={consultando}
            >
              {consultando ? "Consultando..." : "Calcular tarifa"}
            </button>
          </div>
        </form>
        </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        {presupuesto && tarifa !== null && (
          <section aria-live="polite" className="min-w-0 space-y-2">
            <h2 className="mb-4 text-center text-[30px] font-semibold">Datos del presupuesto</h2>
            <table className="w-full table-fixed border-separate border-spacing-1 text-center text-base sm:border-spacing-[7px] sm:text-xl">
                <thead>
                  <tr className="bg-violet-700 text-white">
                    <th className="border border-violet-900 p-2 sm:p-3">Dato</th>
                    <th className="border border-violet-900 p-2 sm:p-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-amber-200">
                    <th className="border border-gray-300 p-2 sm:p-3">Tipo</th>
                    <td className="border border-gray-300 p-2 text-amber-950 sm:p-3">{presupuesto.tipo}</td>
                  </tr>
                  <tr className="bg-cyan-200">
                    <th className="border border-gray-300 p-2 sm:p-3">Páginas</th>
                    <td className="border border-gray-300 p-2 text-cyan-950 sm:p-3">{presupuesto.paginas}</td>
                  </tr>
                  <tr className="bg-lime-200">
                    <th className="border border-gray-300 p-2 sm:p-3">Formulario</th>
                    <td className="border border-gray-300 p-2 text-lime-950 sm:p-3">{String(presupuesto.formulario)}</td>
                  </tr>
                  <tr className="bg-fuchsia-200">
                    <th className="border border-gray-300 p-2 sm:p-3">Segundo idioma</th>
                    <td className="border border-gray-300 p-2 text-fuchsia-950 sm:p-3">{String(presupuesto.segundoIdioma)}</td>
                  </tr>
                  <tr className="bg-violet-200 font-bold">
                    <th className="border border-gray-300 p-2 sm:p-3">Total calculado</th>
                    <td className="border border-gray-300 p-2 text-violet-950 sm:p-3">{tarifa} €</td>
                  </tr>
                </tbody>
              </table>
          </section>
        )}
        {tarifas && (
          <div className="m-[20px] rounded-xl bg-orange-950 p-[20px]">
          <section className="min-w-0 rounded-xl border border-violet-300 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100 p-6 shadow-sm" aria-labelledby="tabla-tarifas">
            <h2 className="mb-4 text-center text-[30px] font-semibold text-slate-800" id="tabla-tarifas">
              Tarifas disponibles
            </h2>
            <div className="m-[11px] bg-green-500 p-[11px]">
            <table className="w-full border-separate border-spacing-[7px] text-center text-[20px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-slate-600 p-3">Concepto</th>
                  <th className="border border-slate-600 p-3">Precio</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tarifas).map(([concepto, precio]) => (
                  <tr className="odd:bg-slate-100 even:bg-white" key={concepto}>
                    <th className="border border-slate-300 p-3 font-medium">{concepto}</th>
                    <td className="border border-slate-300 p-3">{precio} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
          </div>
        )}
        </div>
        <section className="mx-6 mb-6 min-w-0 rounded-xl border border-violet-300 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-indigo-100 p-6 shadow-sm" aria-labelledby="tabla-pruebas">
          <h2 className="mb-4 text-center text-[30px] font-semibold text-slate-800" id="tabla-pruebas">
            Pruebas
          </h2>
          <div className="m-[11px] bg-green-500 p-[11px]">
            <table className="w-full border-separate border-spacing-[7px] text-center text-[20px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-slate-600 p-3">Prueba</th>
                  <th className="border border-slate-600 p-3">Datos de entrada</th>
                  <th className="border border-slate-600 p-3">Resultado esperado</th>
                </tr>
              </thead>
              <tbody>
                {pruebas.map((prueba) => (
                  <tr className="odd:bg-slate-100 even:bg-white" key={prueba.nombre}>
                    <th className="border border-slate-300 p-3 font-medium">{prueba.nombre}</th>
                    <td className="border border-slate-300 p-3">{prueba.entrada}</td>
                    <td className="border border-slate-300 p-3">{prueba.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {mensaje && <p aria-live="polite">{mensaje}</p>}
      </section>
    </main>
  )
}
