export default {
 async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    // OBTENER O GUARDAR NOTAS DEL DÍA
    if (url.pathname === '/api/notas') {
        if (request.method === 'GET') {
            try {
                const { results } = await env.DB.prepare("SELECT valor FROM configuracion WHERE clave = 'nota_dia'").all();
                const nota = results.length > 0 ? results[0].valor : "";
                return new Response(JSON.stringify({ ok: true, nota }), { headers });
            } catch (err) {
                return new Response(JSON.stringify({ ok: false, error: err.message }), { headers });
            }
        }

        if (request.method === 'POST') {
            try {
                const body = await request.json();
                const notaTexto = body.nota || "";

                await env.DB.prepare(
                    "INSERT INTO configuracion (clave, valor) VALUES ('nota_dia', ?) ON CONFLICT(clave) DO UPDATE SET valor = ?"
                ).bind(notaTexto, notaTexto).run();

                return new Response(JSON.stringify({ ok: true, mensaje: "Nota actualizada correctamente" }), { headers });
            } catch (err) {
                return new Response(JSON.stringify({ ok: false, error: err.message }), { headers });
            }
        }
    }

    // OBTENER TODOS LOS REGISTROS
    if (request.method === "GET" && url.pathname === "/api/planeacion") {
      const registros = await env.DB.prepare(`
        SELECT ot, estadoProgramacion, fechaProgramacion, observacion, estadoGestion, tecnicoAsignado, acompanamiento, updatedAt, createdAt
        FROM planeacion
      `).all();

      const resultado = {};
      for (const fila of registros.results) {
        resultado[fila.ot] = fila;
      }

      return new Response(JSON.stringify(resultado), { headers });
    }

    // VERIFICAR CONTRASEÑA ADMIN
    if (request.method === "POST" && url.pathname === "/api/planeacion/verificar") {
      const body = await request.json();
      if (body.password === env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ ok: true }), { headers });
      }
      return new Response(JSON.stringify({ ok: false, error: "Contraseña incorrecta" }), { status: 403, headers });
    }

    // NUEVA RUTA: CARGUE MASIVO Y LECTURA DE EXCEL (Tabla: base_backlog)
    if (url.pathname === "/api/base-backlog") {
      if (request.method === "GET") {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM base_backlog").all();
          const registrosFormateados = {};
          results.forEach(row => {
            try {
              registrosFormateados[row.ot] = JSON.parse(row.datos_json);
            } catch (e) {
              registrosFormateados[row.ot] = { OT: row.ot };
            }
          });
          return new Response(JSON.stringify(registrosFormateados), { headers });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          const otKey = Object.keys(body).find(k => k.trim().toLowerCase() === 'ot');
          const ot = otKey ? String(body[otKey]).trim() : "";

          if (!ot) {
            return new Response(JSON.stringify({ ok: false, error: "No se encontró la columna OT en esta fila" }), { status: 400, headers });
          }

          const datosJsonStr = JSON.stringify(body);

          await env.DB.prepare(`
            INSERT INTO base_backlog (ot, datos_json, actualizado_en)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(ot) DO UPDATE SET
              datos_json = excluded.datos_json,
              actualizado_en = CURRENT_TIMESTAMP
          `).bind(ot, datosJsonStr).run();

          return new Response(JSON.stringify({ ok: true, mensaje: "Fila guardada con éxito en base_backlog" }), { headers });
        } catch (err) {
          return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers });
        }
      }
    }

    // GUARDAR O ACTUALIZAR UNA OT
    if (request.method === "POST" && url.pathname === "/api/planeacion") {
      const body = await request.json();

      if (!body.ot) {
        return new Response(JSON.stringify({ ok: false, error: "OT requerida" }), {
          status: 400,
          headers
        });
      }

      const ahora = new Date().toISOString();
      const fechaHoy = body.fechaLocal || ahora.split('T')[0];

      const existing = await env.DB.prepare(`
        SELECT createdAt FROM planeacion WHERE ot = ?
      `).bind(body.ot).first();

      let createdAt = fechaHoy;
      if (body.customCreatedAt && /^\d{4}-\d{2}-\d{2}$/.test(body.customCreatedAt)) {
        createdAt = body.customCreatedAt;
      } else if (existing && existing.createdAt) {
        createdAt = existing.createdAt;
      }

      const registro = {
        ot: body.ot,
        estadoProgramacion: body.estadoProgramacion || "",
        fechaProgramacion: body.fechaProgramacion || "",
        observacion: body.observacion !== undefined && body.observacion !== null ? body.observacion : "",
        estadoGestion: body.estadoGestion || "",
        tecnicoAsignado: body.tecnicoAsignado || "",
        acompanamiento: body.acompanamiento || "",
        updatedAt: ahora,
        createdAt: createdAt
      };

      await env.DB.prepare(`
        INSERT OR REPLACE INTO planeacion (
          ot, estadoProgramacion, fechaProgramacion, observacion, estadoGestion, tecnicoAsignado, acompanamiento, updatedAt, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        registro.ot,
        registro.estadoProgramacion,
        registro.fechaProgramacion,
        registro.observacion,
        registro.estadoGestion,
        registro.tecnicoAsignado,
        registro.acompanamiento,
        registro.updatedAt,
        registro.createdAt
      )
      .run();

      return new Response(JSON.stringify({ ok: true, createdAt }), { headers });
    }

    // ELIMINAR REGISTROS (PROTEGIDO CON ADMIN_PASSWORD)
    if (request.method === "DELETE" && url.pathname === "/api/planeacion") {
      const passwordHeader = request.headers.get("x-admin-password");

      if (!passwordHeader || passwordHeader !== env.ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ ok: false, error: "No autorizado. Clave incorrecta." }), {
          status: 403,
          headers
        });
      }

      const otParam = url.searchParams.get("ot");

      if (otParam) {
        await env.DB.prepare("DELETE FROM planeacion WHERE ot = ?").bind(otParam).run();
        return new Response(JSON.stringify({ ok: true, message: `OT ${otParam} eliminada` }), { headers });
      } else {
        await env.DB.prepare("DELETE FROM planeacion").run();
        return new Response(JSON.stringify({ ok: true, message: "Tabla vaciada exitosamente" }), { headers });
      }
    }

    return new Response(JSON.stringify({ ok: false, error: "Ruta no encontrada" }), {
      status: 404,
      headers
    });
 }
};
