// Melhorias que dependem de JavaScript. Sem JS, tudo continua funcionando (docs/PRD.md, RNF04).

// 1. Pede confirmação antes de enviar formulários marcados com data-confirmar (ex.: excluir).
document.addEventListener('submit', (evento) => {
  const mensagem = evento.target.dataset.confirmar;
  if (mensagem && !window.confirm(mensagem)) {
    evento.preventDefault();
  }
});

// 2. Contador de caracteres nos campos com maxlength e data-contador (ex.: "123/1000").
document.querySelectorAll('[data-contador][maxlength]').forEach((campo) => {
  const limite = Number(campo.getAttribute('maxlength'));
  const contador = document.createElement('p');
  contador.className = 'contador-caracteres';
  contador.setAttribute('aria-live', 'polite');
  campo.insertAdjacentElement('afterend', contador);

  const atualizar = () => {
    const restantes = limite - campo.value.length;
    contador.textContent = `${campo.value.length}/${limite} caracteres`;
    contador.classList.toggle('perto-do-limite', restantes <= limite * 0.1);
  };
  campo.addEventListener('input', atualizar);
  atualizar();
});
