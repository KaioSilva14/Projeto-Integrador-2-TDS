// Pede confirmação antes de enviar formulários marcados com data-confirmar (ex.: excluir).
// Sem JavaScript o formulário continua funcionando, só sem a pergunta (docs/PRD.md, RNF04).
document.addEventListener('submit', (evento) => {
  const mensagem = evento.target.dataset.confirmar;
  if (mensagem && !window.confirm(mensagem)) {
    evento.preventDefault();
  }
});
