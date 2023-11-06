const promptSync = require('prompt-sync')();

class Perfil {
  private _id: number;
  private _nome: string;
  private _email: string;
  private _postagens: Postagem[] = [];

  constructor(id: number, nome: string, email: string) {
    this._id = id;
    this._nome = nome;
    this._email = email;
  }

  get id(): number {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get email(): string {
    return this._email;
  }

  get postagens(): Postagem[] {
    return this._postagens;
  }
}

class Postagem {
  private _id: number;
  private _texto: string;
  private _curtidas: number;
  private _descurtidas: number;
  private _data: Date;
  private _perfil: Perfil;
  private _comentarios: Comentario[] = [];


  constructor(id: number, texto: string, curtidas: number, descurtidas: number, data: Date, perfil: Perfil) {
    this._id = id;
    this._texto = texto;
    this._curtidas = curtidas;
    this._descurtidas = descurtidas;
    this._data = data;
    this._perfil = perfil;
  }

  get id(): number {
    return this._id;
  }

  get texto(): string {
    return this._texto;
  }

  get curtidas(): number {
    return this._curtidas;
  }

  get descurtidas(): number {
    return this._descurtidas;
  }

  get data(): Date {
    return this._data;
  }

  get perfil(): Perfil {
    return this._perfil;
  }
  
  get comentarios(): Comentario[] {
    return this._comentarios;
  }

  curtir(): void {
    this._curtidas++;
  }

  descurtir(): void {
    this._descurtidas++;
  }

  ehPopular(): boolean {
    return this._curtidas > 1.5 * this._descurtidas;
  }

  adicionarComentario(id: number, texto: string, perfil: Perfil): void {
    const comentario = new Comentario(id, texto, perfil);
    this._comentarios.push(comentario);
  }

  excluirComentario(idComentario: number): void {
    const index = this.comentarios.findIndex((comentario) => comentario.id === idComentario);
  
    if (index !== -1) {
      this.comentarios.splice(index, 1);
      console.log("Comentário excluído com sucesso.");
    } else {
      console.log("Erro: Comentário não encontrado.");
    }
  }

}

class PostagemAvancada extends Postagem {
  public _hashtags: string[];
  public _visualizacoesRestantes: number;

  constructor(
    id: number,
    texto: string,
    curtidas: number,
    descurtidas: number,
    data: Date,
    perfil: Perfil,
    hashtags: string[],
    visualizacoesRestantes: number
    ) {
      super(id, texto, curtidas, descurtidas, data, perfil);
      this._hashtags = hashtags;
      this._visualizacoesRestantes = visualizacoesRestantes;
    }
    
    get hashtags(): string[] {
    return this._hashtags;
  }
  
  get visualizacoesRestantes(): number {
    return this._visualizacoesRestantes;
  }
  
  adicionarHashtag(hashtag: string): void {
    this._hashtags.push(hashtag);
  }

  existeHashtag(hashtag: string): boolean {
    return this._hashtags.includes(hashtag);
  }
  
  decrementarVisualizacoes(): void {
    if (this._visualizacoesRestantes > 0) {
      this._visualizacoesRestantes--;
    }
  }
}

class Comentario {
  private _id: number;
  private _texto: string;
  private _perfil: Perfil;

  constructor(id: number, texto: string, perfil: Perfil) {
    this._id = id;
    this._texto = texto;
    this._perfil = perfil;
  }

  get id(): number {
    return this._id;
  }

  get texto(): string {
    return this._texto;
  }

  get perfil(): Perfil {
    return this._perfil;
  }
}
class RepositorioDePerfis {
  private _perfis: Perfil[] = [];
  
  incluir(perfil: Perfil): void {
    this._perfis.push(perfil);
  }

  consultar(id?: number, nome?: string, email?: string): Perfil | null {
    const perfil = this._perfis.find(
      (p) =>
        (id !== undefined && p.id === id) ||
        (nome !== undefined && p.nome === nome) ||
        (email !== undefined && p.email === email)
    );
    return perfil || null;
  }

  remover(id: number): void {
    const index = this._perfis.findIndex((perfil) => perfil.id === id);
    if (index !== -1) {
      this._perfis.splice(index, 1);
    }
  }

}

class RepositorioDePostagens {
  private _postagens: Postagem[] = [];
  
  get postagens(): Postagem[] {
    return this._postagens;
  }

  incluir(postagem: Postagem): void {
    this._postagens.push(postagem);
    if (postagem.perfil) {
      postagem.perfil.postagens.push(postagem);
    }
  }

  consultar(id?: number, texto?: string, hashtag?: string, perfil?: Perfil): Postagem[] {
    return this._postagens.filter((postagem) => {
      if (id !== undefined && postagem.id !== id) {
        return false;
      }

      if (texto !== undefined && !postagem.texto.includes(texto)) {
        return false;
      }

      if (hashtag !== undefined && postagem instanceof PostagemAvancada) {
        const postagemAvancada = postagem as PostagemAvancada;
        if (!postagemAvancada._hashtags.includes(hashtag)) {
          return false;
        }
      }

      if (perfil !== undefined && postagem.perfil !== perfil) {
        return false;
      }

      return true;
    });
  }

  exibirTodasAsPostagens(): Postagem[] {
    return this._postagens;
  }
}

class RedeSocial {
  private _repositorioDePostagens: RepositorioDePostagens;
  private _repositorioDePerfis: RepositorioDePerfis;

  constructor() {
    this._repositorioDePostagens = new RepositorioDePostagens();
    this._repositorioDePerfis = new RepositorioDePerfis();
  }

  incluirPerfil(perfil: Perfil): void {
    if (!perfil.id || !perfil.nome || !perfil.email) {
      console.log("Erro: Todos os atributos do perfil devem ser preenchidos.");
      return;
    }

    if (
      this._repositorioDePerfis.consultar(perfil.id) ||
      this._repositorioDePerfis.consultar(undefined, perfil.nome) ||
      this._repositorioDePerfis.consultar(undefined, undefined, perfil.email)
    ) {
      console.log("Erro: Já existe um perfil com o mesmo ID, nome ou email.");
      return;
    }

    this._repositorioDePerfis.incluir(perfil);
    console.log("Perfil criado com sucesso. Seja bem vindo!");
  }

  consultarPerfil(id?: number, nome?: string, email?: string): Perfil | null {
    return this._repositorioDePerfis.consultar(id, nome, email);
  }

  incluirPostagem(postagem: Postagem): void {
    if (!postagem.id || !postagem.texto || postagem.curtidas === undefined || postagem.descurtidas === undefined || !postagem.data || !postagem.perfil) {
      console.log("Erro: Todos os atributos devem ser preenchidos.");
      return;
    }

    if (this._repositorioDePostagens.consultar(postagem.id).length > 0) {
      console.log("Erro: Já existe uma postagem com o mesmo ID.");
      
      return;
    }

    this._repositorioDePostagens.incluir(postagem);
    console.log("Postagem criada com sucesso.");
  }

  consultarPostagens(id?: number, texto?: string, hashtag?: string, perfil?: Perfil): Postagem[] {
    const postagens = this._repositorioDePostagens.consultar(id, texto, hashtag, perfil);
  
    postagens.forEach((postagem) => {
      if (postagem instanceof PostagemAvancada) {
        postagem.decrementarVisualizacoes(); // Decrementa visualizações aqui para todas as postagens avançadas
      }
    });
  
    const postagensExibiveis = postagens.filter((postagem) => {
      if (postagem instanceof PostagemAvancada) {
        return postagem.visualizacoesRestantes > 0;
      }
      return true;
    });
  
    return postagensExibiveis;
  }

  curtir(idPostagem: number): void {
    const postagem = this._repositorioDePostagens.consultar(idPostagem)[0];
    if (postagem) {
      postagem.curtir();
      console.log("Postagem curtida com sucesso.");
    } else {
      console.log("Erro: Postagem não encontrada.");
    }
  }

  descurtir(idPostagem: number): void {
    const postagem = this._repositorioDePostagens.consultar(idPostagem)[0];
    if (postagem) {
      postagem.descurtir();
      console.log("Postagem descurtida com sucesso.");
    } else {
      console.log("Erro: Postagem não encontrada.");
    }
  }

  decrementarVisualizacoes(postagem: PostagemAvancada): void {
    if (postagem instanceof PostagemAvancada) {
      postagem.decrementarVisualizacoes();
      if (postagem._visualizacoesRestantes < 0) {
        postagem._visualizacoesRestantes = 0;
      }
    }
  }

  exibirPostagensPorPerfil(id: number): Postagem[] {
    const perfil = this._repositorioDePerfis.consultar(id);
    if (!perfil) {
      console.log("Perfil não encontrado.");
      return [];
    }
  
    const postagens = perfil.postagens;
    
    const postagensExibiveis = postagens.filter((postagem) => {
      if (postagem instanceof PostagemAvancada) {
        if (postagem.visualizacoesRestantes > 0) {
          postagem.decrementarVisualizacoes(); // Decrementa visualizações aqui
          return true; // Retorna verdadeiro apenas se ainda houver visualizações restantes
        }
        return false;
      }
      return true;
    });

    return postagensExibiveis;
  }
  
  exibirPostagensPorHashtag(hashtag: string): PostagemAvancada[] {
    const postagens = this._repositorioDePostagens.consultar(undefined, undefined, hashtag);
  
    postagens.forEach((postagem) => {
      if (postagem instanceof PostagemAvancada) {
        postagem.decrementarVisualizacoes(); // Decrementa visualizações aqui
      }
    });
  
    const postagensExibiveis = postagens.filter((postagem) => {
      if (postagem instanceof PostagemAvancada) {
        if (postagem.visualizacoesRestantes > 0) {
          return true; // Retorna verdadeiro apenas se ainda houver visualizações restantes
        }
        return false;
      }
    });
  
    return postagensExibiveis as PostagemAvancada[];
  }

  exibirHashtagsPopulares(): string[] {
    const hashtags: { [hashtag: string]: { count: number, posts: number[] } } = {};
  
    for (const postagem of this._repositorioDePostagens.postagens) {
      if (postagem instanceof PostagemAvancada) {
        for (const hashtag of postagem.hashtags) {
          if (hashtags[hashtag]) {
            hashtags[hashtag].count++;
            if (!hashtags[hashtag].posts.includes(postagem.id)) {
              hashtags[hashtag].posts.push(postagem.id);
            }
          } else {
            hashtags[hashtag] = { count: 1, posts: [postagem.id] };
          }
        }
      }
    }
  
    const popularHashtags: string[] = [];
  
    for (const hashtag in hashtags) {
      if (hashtags[hashtag].count > 1) { // Só considerar hashtags presentes em mais de uma postagem
        popularHashtags.push(`Hashtag: ${hashtag}, Número de Postagens: ${hashtags[hashtag].count}`);
      }
    }
    return popularHashtags;
  }
  
  excluirPostagem(id: number): void {
    const postagens = this._repositorioDePostagens.consultar(id);
  
    if (postagens.length === 0) {
      console.log("Erro: Postagem não encontrada.");
      return;
    }
  
    const postagem = postagens[0];
  
    if (postagem.perfil) {
      const perfil = this._repositorioDePerfis.consultar(postagem.perfil.id);
  
      if (perfil) {
        const index = perfil.postagens.indexOf(postagem);
  
        if (index !== -1) {
          perfil.postagens.splice(index, 1);
        }
      }
    }
  
    const index = this._repositorioDePostagens.postagens.indexOf(postagem);
  
    if (index !== -1) {
      this._repositorioDePostagens.postagens.splice(index, 1);
    }
  
    console.log("Postagem excluída com sucesso.");
  }
  
  excluirPerfil(id: number): void {
    const perfil = this._repositorioDePerfis.consultar(id);

    if (!perfil) {
      console.log("Perfil não encontrado.");
      return;
    }

    // Remova todas as postagens associadas ao perfil
    perfil.postagens.forEach((postagem) => {
      this.excluirPostagem(postagem.id);
    });

    // Remova o perfil do repositório de perfis
    this._repositorioDePerfis.remover(id);
    console.log("Perfil excluído com sucesso.");
  }

  exibirTodasAsPostagens(): void {
    const postagens = this._repositorioDePostagens.exibirTodasAsPostagens();
    
    if (postagens.length > 0) {
      postagens.forEach((postagem) => {
        if (postagem instanceof PostagemAvancada && postagem.visualizacoesRestantes === 0) {
          // Não exibe postagens avançadas com visualizações esgotadas
          return;}
        console.log(`\n${postagem.data}`);
        console.log(`${postagem.perfil.nome}: ${postagem.texto}`);
        if (postagem instanceof PostagemAvancada) {
          console.log(`${postagem.hashtags}`);
          console.log(`Visualizações Restantes: ${postagem.visualizacoesRestantes}`);
          if (postagem.visualizacoesRestantes > 0) {
            postagem.decrementarVisualizacoes(); // Decrementa visualizações aqui
          }
        }
        console.log(`${postagem.curtidas} curtidas, ${postagem.descurtidas} descurtidas. ${postagem.ehPopular() ? 'Postagem Popular' : ''}`);
        if (postagem.comentarios.length > 0) {
          console.log(`Número de Comentários: ${postagem.comentarios.length}`);
          postagem.comentarios.forEach((comentario) => {
            console.log(` - ${comentario.perfil.nome}: ${comentario.texto}`);
          });
        }
      });
    } else {
      console.log("Nenhuma postagem encontrada.");
    }
  }

}  

class App {
  private redeSocial: RedeSocial;

  constructor() {
    this.redeSocial = new RedeSocial();
  }

  exibirMenu(): void {
    while (true) {
      console.log(`
      ------------------------IFPIBOOK------------------------
      
  [PRESSIONE 1] -> Criar Perfil                                     
  [PRESSIONE 2] -> Criar Postagem                                   
  [PRESSIONE 3] -> Criar Postagem Avançada                          
  [PRESSIONE 4] -> Consultar Perfil                                 
  [PRESSIONE 5] -> Consultar Postagem e Curtir/Descurtir Postagem   
  [PRESSIONE 6] -> Exibir Postagens por Hashtag                     
  [PRESSIONE 7] -> Exibir Postagens por Perfil                      
  [PRESSIONE 8] -> Remover Perfil
  [PRESSIONE 9] -> Excluir Postagem
  [PRESSIONE 10] -> Adicionar comentário
  [PRESSIONE 11] -> Excluir comentário
  [PRESSIONE 12] -> Exibir postagens Populares
  [PRESSIONE 13] -> Exibir hashtags Populares
  [PRESSIONE 14] -> Exibir o Feed Completo
  [PRESSIONE 15] -> Ver Perfis
  \n[PRESSIONE 0] -> SAIR DO IFPIBOOK
      `);

      const opcao = promptSync("Escolha uma opção:\n >>>  ");

      switch (opcao) {
        case '1':
          this.criarPerfil();
          break;
        case '2':
          this.criarPostagem();
          break;
        case '3':
          this.criarPostagemAvancada();
          break;
        case '4':
          this.consultarPerfil();
          break;
        case '5':
          this.consultarPostagens();
          break;
        case '6':
          this.exibirPostagensPorHashtag();
          break;
        case '7':
          this.exibirPostagensPorPerfil();
          break;
        case '8':
          this.excluirPerfil();
          break;
        case '9':
          this.excluirPostagem();
          break;
        case '10':
          this.adicionarComentario();
          break;
        case '11':
          this.excluirComentario();
          break;
        case '12':
          this.exibirPostagensPopulares();
          break;
        case '13':
          this.exibirHashtagsPopulares();
          break;
        case '14':
          this.exibirTodasAsPostagens();
          break;
        case '0':
          console.log("Saindo do IFPIBOOK");
          return;
        default:
          console.log("Opção inválida. Escolha uma opção válida.");
      }
    }
  }

    menuCurtirDescurtir(postagem: Postagem): void {
      while (true) {
        console.log(`
        Escolha uma opção:
        1. Curtir Postagem
        2. Descurtir Postagem
        0. Voltar
        `);
  
        const opcao = promptSync("Escolha uma opção: ");
  
        switch (opcao) {
          case '1':
            this.redeSocial.curtir(postagem.id);
            break;
          case '2':
            this.redeSocial.descurtir(postagem.id);
            break;
          case '0':
            return;
          default:
            console.log("Opção inválida. Escolha uma opção válida.");
        }
      }
    }
  
    criarPerfil(): void {
      const id = parseInt(promptSync("Digite o seu ID: "));
      const nome = promptSync("Digite seu nome: ");
      const email = promptSync("Digite seu email: ");
  
      const perfil = new Perfil(id, nome, email);
      this.redeSocial.incluirPerfil(perfil);
    }
  
    criarPostagem(): void {
      const perfilId = parseInt(promptSync("Digite o ID do perfil da postagem: "));
      const id = parseInt(promptSync("Digite o ID da postagem: "));
      const texto = promptSync("Digite o texto da postagem: ");
  
      const perfil = this.redeSocial.consultarPerfil(perfilId);
      if (!perfil) {
        console.log("Erro: Perfil inexistente.");
        
        return;
        
      }
      const postagem = new Postagem(id, texto, 0, 0, new Date(), perfil);
      this.redeSocial.incluirPostagem(postagem);
    }

    criarPostagemAvancada(): void {
      const perfilId = parseInt(promptSync("Digite o ID do perfil da postagem: "));
      const id = parseInt(promptSync("Digite o ID da postagem: "));
      const texto = promptSync("Digite o texto da postagem: ");
      const hashtagsInput = promptSync("Deseja adicionar hashtags a esta postagem? (1 para sim, 0 para não): ");
      let hashtags: string[] = [];

      if (hashtagsInput === "1") {
        const hashtagsString = promptSync("Digite as hashtags (separadas por vírgula): ");
        hashtags = hashtagsString.split(',');
      }

      const visualizacoesRestantes = parseInt(promptSync("Digite o número de visualizações para a sua postagem: "));
  
      const perfil = this.redeSocial.consultarPerfil(perfilId);
      if (perfil) {
        const postagemAvancada = new PostagemAvancada(id, texto, 0, 0, new Date(), perfil, hashtags, visualizacoesRestantes);
        this.redeSocial.incluirPostagem(postagemAvancada);

        // Utilize os métodos da classe PostagemAvancada
       
      } else {
        console.log("Perfil não encontrado. A postagem não pôde ser criada.");
      }
    }
  
    consultarPerfil(): void {
      const id = parseInt(promptSync("Digite o ID do perfil: "));
      const perfil = this.redeSocial.consultarPerfil(id);
      if (perfil) {
        console.log(`Perfil encontrado: ${perfil.nome}`);
        console.log(`Quantidade de postagens: ${perfil.postagens.length}`);
      } else {
        console.log("Perfil não encontrado.");
      }
    }
  
    consultarPostagens(): void {
      const id = parseInt(promptSync("Digite o ID da postagem: "));
      const postagens = this.redeSocial.consultarPostagens(id);
    
      if (postagens.length === 0) {
        console.log("Nenhuma postagem encontrada.");
        return;
      }
    
      postagens.forEach((postagem) => {
        console.log(`\n${postagem.data}`);
        console.log(`${postagem.perfil.nome}: ${postagem.texto}`);
        if (postagem instanceof PostagemAvancada) {
          console.log(`${postagem.hashtags}`);
          console.log(`Visualizações Restantes: ${postagem.visualizacoesRestantes}`);
        }
        console.log(`${postagem.curtidas} curtidas, ${postagem.descurtidas} descurtidas. ${postagem.ehPopular() ? 'Postagem Popular' : ''}`);
        if (postagem.comentarios.length > 0) {
          console.log(`Número de Comentários: ${postagem.comentarios.length}`);
          postagem.comentarios.forEach((comentario) => {
            console.log(` - ${comentario.perfil.nome}: ${comentario.texto}`);
          });
        }        
      });

      if (id) {
        const postagemSelecionada = postagens.find((postagem) => postagem.id === Number(id));
        if (postagemSelecionada) {
          this.menuCurtirDescurtir(postagemSelecionada);
        } else {
          console.log("Postagem não encontrada.");
        }
      }
    }
      
      exibirPostagensPorPerfil(): void {
        const idPerfil = parseInt(promptSync("Digite o ID do perfil: "));
        const postagens = this.redeSocial.exibirPostagensPorPerfil(idPerfil);

        if (postagens.length > 0) {
          postagens.forEach((postagem) => {
          console.log(`\n${postagem.data}`);
          console.log(`${postagem.perfil.nome}: ${postagem.texto}`);
          if (postagem instanceof PostagemAvancada) {
            console.log(`${postagem.hashtags}`);
            console.log(`Visualizações Restantes: ${postagem.visualizacoesRestantes}`);
          }
          console.log(`${postagem.curtidas} curtidas, ${postagem.descurtidas} descurtidas. ${postagem.ehPopular() ? 'Postagem Popular!' : ''}`);
          if (postagem.comentarios.length > 0) {
            console.log(`Número de Comentários: ${postagem.comentarios.length}`);
            postagem.comentarios.forEach((comentario) => {
              console.log(` - ${comentario.perfil.nome}: ${comentario.texto}`);
            });
          }
        });
      } else {
        console.log("Nenhuma postagem encontrada.");
      }
    }
  
    exibirPostagensPorHashtag(): void {
      const hashtag = promptSync("Digite a hashtag: ");
      const postagens = this.redeSocial.exibirPostagensPorHashtag(hashtag);

      if (postagens.length > 0) {
        
        console.log(`Postagens com a hashtag: ${hashtag}`);
        postagens.forEach((postagem) => {
          console.log(`\n${postagem.data}`);
          console.log(`${postagem.perfil.nome}: ${postagem.texto}`);
          if (postagem instanceof PostagemAvancada) {
            console.log(`Visualizações Restantes: ${postagem.visualizacoesRestantes}`);
          }
          console.log(`${postagem.curtidas} curtidas, ${postagem.descurtidas} descurtidas. ${postagem.ehPopular() ? 'Postagem Popular!' : ''}`);
          if (postagem.comentarios.length > 0) {
            console.log(`Número de Comentários: ${postagem.comentarios.length}`);
            postagem.comentarios.forEach((comentario) => {
              console.log(` - ${comentario.perfil.nome}: ${comentario.texto}`);
            });
          }
        });
      } else {
        console.log("Nenhuma postagem encontrada com esta hashtag.");
      }
    }

    exibirPostagensPopulares(): void {
      const postagens = this.redeSocial.consultarPostagens();
    
      if (postagens.length > 0) {
        const postagensPopulares = postagens.filter((postagem) => {
          return postagem.ehPopular() && ((postagem instanceof PostagemAvancada && postagem.visualizacoesRestantes > 0) || postagem instanceof Postagem);
        });
    
        if (postagensPopulares.length > 0) {
          console.log("Postagens Populares:");
          postagensPopulares.forEach((postagem) => {
            console.log(`\n${postagem.data}`);
            console.log(`${postagem.perfil.nome}: ${postagem.texto}`);
            if (postagem instanceof PostagemAvancada) {
              console.log(`Visualizações Restantes: ${postagem.visualizacoesRestantes}`);
            }
            console.log(`${postagem.curtidas} curtidas, ${postagem.descurtidas} descurtidas`);
            if (postagem.comentarios.length > 0) {
              console.log(`Número de Comentários: ${postagem.comentarios.length}`);
              postagem.comentarios.forEach((comentario) => {
                console.log(` - ${comentario.perfil.nome}: ${comentario.texto}`);
              });
            }
          });
        } else {
          console.log("Nenhuma postagem popular encontrada que ainda possa ser exibida.");
        }
      } else {
        console.log("Nenhuma postagem encontrada.");
      }
    }

    exibirHashtagsPopulares(): void {
      const popularHashtags = this.redeSocial.exibirHashtagsPopulares();
    
      if (popularHashtags.length > 0) {
        console.log("Hashtags Populares:");
        popularHashtags.forEach((hashtagInfo) => {
          console.log(hashtagInfo);
        });
      } else {
        console.log("Nenhuma hashtag popular encontrada.");
      }
    }

    adicionarComentario(): void {
      const idPostagem = parseInt(promptSync("Digite o ID da postagem que deseja comentar: "));
      
      const postagem = this.redeSocial.consultarPostagens(idPostagem);
    
      if (postagem.length === 0) {
        console.log("Postagem não encontrada.");
        return;
      }
    
      const perfilId = parseInt(promptSync("Digite o ID do perfil que está comentando: "));
      const perfil = this.redeSocial.consultarPerfil(perfilId);
      
      if (!perfil) {
        console.log("Perfil não encontrado.");
        return;
      }
      const textoComentario = promptSync("Digite o texto do comentário: ");
    
      postagem[0].adicionarComentario(postagem[0].comentarios.length + 1, textoComentario, perfil);
    
      console.log("Comentário adicionado com sucesso.");
    }

    excluirPostagem(): void {
      const idPostagem = parseInt(promptSync("Digite o ID da postagem que deseja excluir: "));
    
      this.redeSocial.excluirPostagem(idPostagem);
    }

    excluirComentario(): void {
      const idPostagem = parseInt(promptSync("Digite o ID da postagem da qual deseja excluir um comentário: "));
      const postagem = this.redeSocial.consultarPostagens(idPostagem);
    
      if (postagem.length === 0) {
        console.log("Postagem não encontrada.");
        return;
      }
    
      if (postagem[0].comentarios.length === 0) {
        console.log("Não há comentários para excluir.");
        return;
      }
    
      console.log("Comentários da postagem:");
      postagem[0].comentarios.forEach((comentario) => {
        console.log(`ID: ${comentario.id}, Texto: ${comentario.texto}`);
      });
    
      const idComentario = parseInt(promptSync("Digite o ID do comentário que deseja excluir: "));
    
      postagem[0].excluirComentario(idComentario);
    }

    excluirPerfil(): void {
      const idPerfil = parseInt(promptSync("Digite o ID do perfil que deseja excluir: "));
      this.redeSocial.excluirPerfil(idPerfil);
    }

    exibirTodasAsPostagens(): void {
      this.redeSocial.exibirTodasAsPostagens();
    }
}

const app = new App();
app.exibirMenu();