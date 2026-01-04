import './modal.css';
import { FiX } from 'react-icons/fi';

export default function Modal({ conteudo, buttomBack }){
  return(
    <div className="modal">
      <div className="container">
        <button className="close" onClick={ buttomBack }>
          <FiX size={25} color="#FFF" />
          Voltar
        </button>

        <main>
          <h2>Detalhes do chamado</h2>

          <div className="row">
            <span>
              Cliente: <i>{conteudo.cliente}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Assunto: <i>{conteudo.assunto}</i>
            </span>
            <span>
              Cadastrado em: <i>{conteudo.createdFormat}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Status: 
              <i className="status-badge" style={{ color: "#FFF", backgroundColor: conteudo.status === 'Em aberto' ? '#5CB85C' : '#999' }}>
                {conteudo.status}
              </i>
            </span>
          </div>

          {conteudo.complemento !== '' && (
            <>
              <h3>Complemento</h3>
              <p>
                {conteudo.complemento}
              </p>
            </>
          )}

          {/* SECÇÃO DE AUDITORIA: Exibe apenas se houver atualização */}
          {conteudo.updatedBy && (
            <div className="audit-info">
              <hr />
              <h4>Histórico de Atualização</h4>
              <span>
                Última alteração por: <strong>{conteudo.updatedBy}</strong>
              </span>
              <br />
              <span>
                Data da alteração: <i>{conteudo.updatedFormat}</i>
              </span>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
