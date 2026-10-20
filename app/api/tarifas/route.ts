import estado from "../../../api/estado.json"
import tarifas from "../../../api/tarifas.json"

type SolicitudTarifa = {
  tipo: "landing" | "corporativa"
  paginas: string
  formulario: "true" | "false"
  segundoIdioma: "true" | "false"
}

function calcularTotal(precioBase: number, costePaginasAdicionales: number, extrasSeleccionados: number[]) {
  return [precioBase, costePaginasAdicionales, ...extrasSeleccionados].reduce(
    (total, importe) => total + importe,
    0
  )
}

function esSolicitudTarifa(valor: unknown): valor is SolicitudTarifa {
  if (typeof valor !== "object" || valor === null) {
    return false
  }

  const solicitud = valor as Record<string, unknown>
  return (
    (solicitud.tipo === "landing" || solicitud.tipo === "corporativa") &&
    typeof solicitud.paginas === "string" &&
    /^\d+$/.test(solicitud.paginas) &&
    Number.isInteger(Number(solicitud.paginas)) &&
    Number(solicitud.paginas) >= 1 &&
    Number(solicitud.paginas) <= 20 &&
    (solicitud.formulario === "true" || solicitud.formulario === "false") &&
    (solicitud.segundoIdioma === "true" ||
      solicitud.segundoIdioma === "false")
  )
}

export async function GET() {
  if (estado.status !== "ok") {
    return Response.json(
      { error: "La API no está disponible en este momento." },
      { status: 503 }
    )
  }

  return Response.json(tarifas)
}

export async function POST(request: Request) {
  if (estado.status !== "ok") {
    return Response.json(
      { error: "La API no está disponible en este momento." },
      { status: 503 }
    )
  }

  let solicitud: unknown
  try {
    solicitud = await request.json()
  } catch {
    return Response.json(
      { error: "La solicitud debe contener un JSON válido." },
      { status: 400 }
    )
  }

  if (!esSolicitudTarifa(solicitud)) {
    return Response.json(
      { error: "Las características introducidas no son válidas." },
      { status: 400 }
    )
  }

  const precioBase =
    solicitud.tipo === "landing"
      ? Number(tarifas.Landing)
      : Number(tarifas["Web-corporativa"])
  const precioPaginaAdicional = Number(tarifas["Pagina-adicional-a-primera"])
  const cantidadPaginasAdicionales = Number(solicitud.paginas) - 1
  const costePaginasAdicionales =
    cantidadPaginasAdicionales * precioPaginaAdicional
  const extrasSeleccionados = [
    ...(solicitud.formulario === "true"
      ? [{ nombre: "Formulario de contacto", precio: Number(tarifas["Formulario-contacto"]) }]
      : []),
    ...(solicitud.segundoIdioma === "true"
      ? [{ nombre: "Segundo idioma", precio: Number(tarifas["Segundo-idioma"]) }]
      : []),
  ]
  const total = calcularTotal(
    precioBase,
    costePaginasAdicionales,
    extrasSeleccionados.map((extra) => extra.precio)
  )

  return Response.json({
    tarifas,
    presupuesto: {
      tipo: solicitud.tipo,
      paginas: Number(solicitud.paginas),
      formulario: solicitud.formulario === "true",
      segundoIdioma: solicitud.segundoIdioma === "true",
      precioBase,
      cantidadPaginasAdicionales,
      precioPorPaginaAdicional: precioPaginaAdicional,
      costePaginasAdicionales,
      extrasSeleccionados,
      total,
    },
    total,
  })
}
