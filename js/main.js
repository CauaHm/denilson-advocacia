(function(){
  'use strict';

  var navLinks = document.getElementById('nav-links');
  var menuToggle = document.getElementById('menu-toggle');
  if(menuToggle){
    menuToggle.addEventListener('click', function(){
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Cabeçalho ganha sombra ao rolar; a margem acompanha a folha atual
  var header = document.querySelector('header');
  var margemTraco = document.getElementById('margem-traco');
  var margemNum = document.getElementById('margem-num');

  // Cada seção é uma "folha" dos autos
  var folhas = ['topo','areas','sobre','diferenciais','equipe','servicos','desempenho','depoimentos','faq','contato']
    .map(function(id){ return document.getElementById(id); })
    .filter(Boolean);

  function aoRolar(){
    if(header){
      header.classList.toggle('scrolled', window.scrollY > 10);
    }

    var rolavel = document.documentElement.scrollHeight - window.innerHeight;
    var pct = rolavel > 0 ? Math.max(0, Math.min(1, window.scrollY / rolavel)) : 0;

    // O traço desce a margem conforme a leitura avança
    if(margemTraco){
      margemTraco.style.top = (pct * 100) + '%';
    }

    // A numeração acompanha a seção em leitura. A referência fica logo abaixo
    // do cabeçalho, e não no meio da tela: seções curtas (Serviços tem 507px,
    // menos que meia viewport) seriam puladas se medidas pelo centro.
    if(margemNum && folhas.length){
      var alturaCabecalho = header ? header.getBoundingClientRect().height : 0;
      var referencia = window.scrollY + alturaCabecalho + 24;
      var atual = 1;
      for(var i = 0; i < folhas.length; i++){
        if(folhas[i].offsetTop <= referencia){ atual = i + 1; }
      }
      var texto = atual < 10 ? '0' + atual : String(atual);
      if(margemNum.textContent !== texto){ margemNum.textContent = texto; }
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar, { passive: true });
  aoRolar();

  var anoEl = document.getElementById('ano');
  if(anoEl){ anoEl.textContent = new Date().getFullYear(); }

  // Revelação suave ao rolar a página
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Destaque do item de menu ativo conforme a seção visível
  if(navLinks){
    var sectionIds = ['sobre','areas','equipe','desempenho','faq','contato'];
    var sections = sectionIds.map(function(id){ return document.getElementById(id); }).filter(Boolean);
    var navA = navLinks.querySelectorAll('a[href^="#"]');
    if('IntersectionObserver' in window && sections.length){
      var navIo = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            navA.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id); });
          }
        });
      }, { threshold: 0.4 });
      sections.forEach(function(s){ navIo.observe(s); });
    }
  }

  // Formulário de contato: monta a mensagem e abre o WhatsApp com os dados preenchidos.
  // Isso é uma integração real (o texto chega de fato ao advogado via WhatsApp),
  // não um formulário decorativo. Nenhum dado é armazenado neste site.
  var form = document.getElementById('contato-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      // O form usa novalidate para que a validação aconteça aqui, sob nosso controle.
      // reportValidity() exibe as mensagens nativas do navegador e impede o envio
      // enquanto nome, mensagem e o consentimento LGPD não estiverem preenchidos.
      if(!form.reportValidity()){ return; }

      var nome = document.getElementById('nome').value.trim();
      var email = document.getElementById('email').value.trim();
      var telefone = document.getElementById('telefone').value.trim();
      var area = document.getElementById('area').value;
      var mensagem = document.getElementById('mensagem').value.trim();

      var partes = ['Olá! Meu nome é ' + nome + '.'];
      if(area){ partes.push('Área de interesse: ' + area + '.'); }
      partes.push(mensagem);
      if(telefone){ partes.push('Telefone para retorno: ' + telefone + '.'); }
      if(email){ partes.push('E-mail: ' + email + '.'); }

      var texto = partes.join(' ');
      window.open('https://wa.me/5515996849382?text=' + encodeURIComponent(texto), '_blank');

      // Ponto de integração opcional: caso o escritório queira receber uma cópia
      // por e-mail além do WhatsApp, é possível plugar um serviço como
      // Resend, EmailJS ou um webhook próprio aqui. Exemplo (requer conta e chave):
      //
      // emailjs.send('SERVICE_ID', 'TEMPLATE_ID', { nome, email, telefone, area, mensagem }, 'PUBLIC_KEY');
    });
  }
})();
