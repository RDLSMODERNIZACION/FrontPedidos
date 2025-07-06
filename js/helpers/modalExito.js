export function mostrarModalExito(id = '') {
  const modalId = 'modalExito';

  if (!document.getElementById(modalId)) {
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="${modalId}Label">Formulario enviado ✅</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center">
              <p>¡Tu solicitud fue enviada correctamente!</p>
              <p><strong>ID del trámite:</strong><br><span class="text-primary">${id}</span></p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } else {
    const idContainer = document.querySelector(`#${modalId} .modal-body span.text-primary`);
    if (idContainer) {
      idContainer.textContent = id;
    }
  }

  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}

export function mostrarModalError(mensaje = 'Ocurrió un error', autocerrar = true, ms = 3000) {
  const modalId = 'modalError';

  if (!document.getElementById(modalId)) {
    const html = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-danger">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="${modalId}Label">❌ Error en el formulario</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center">
              <p id="mensajeModalError">${mensaje}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
  } else {
    const contenedor = document.getElementById('mensajeModalError');
    if (contenedor) contenedor.textContent = mensaje;
  }

  const modalElement = document.getElementById(modalId);
  const modal = new bootstrap.Modal(modalElement);
  modal.show();

  if (autocerrar) {
    setTimeout(() => {
      modal.hide();
    }, ms);
  }
}
