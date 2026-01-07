import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [personagens, setPersonagens] = useState([])
  const [nome, setNome] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [personagemSelecionado, setPersonagemSelecionado] = useState(null)

  useEffect(() => {
    chamarApi()
  }, [])

  function mostrarDetalhes(personagem) {
    setPersonagemSelecionado(personagem)
  }

  async function chamarApi() {
    setCarregando(true)
    try {
      const { data } = await axios.get('https://rickandmortyapi.com/api/character')
      const totalPages = data.info.pages

      const allRequests = []
      for (let i = 1; i <= totalPages; i++) {
        allRequests.push(axios.get(`https://rickandmortyapi.com/api/character?page=${i}`))
      }

      const allResponses = await Promise.all(allRequests)
      const allCharacters = allResponses.flatMap(res => res.data.results)

      setPersonagens(allCharacters)
    } catch (err) {
      console.log('Erro ao buscar personagens:', err)
    } finally {
      setCarregando(false)
    }
  }

  async function buscarPersonagem() {
    setCarregando(true)
    try {
      const isNumero = !isNaN(nome) && nome.trim() !== ''

      if (isNumero) {
        const retorno = await axios.get(`https://rickandmortyapi.com/api/character/${nome}`)
        setPersonagens([retorno.data])
      } else {
        const retorno = await axios.get(`https://rickandmortyapi.com/api/character/?name=${nome}`)
        setPersonagens(retorno.data.results)
      }

    } catch (err) {
      console.log('Ocorreu um erro', err)
      setPersonagens([])
    } finally {
      setCarregando(false)
    }
  }

  if (personagemSelecionado) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setPersonagemSelecionado(null)} className="voltar-btn">
          <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>←</span>
          <h2>Detalhes do personagem</h2>
        </div>

        <div className="detalhes">
          <img src={personagemSelecionado.image} alt={personagemSelecionado.name} />
          <h2>{personagemSelecionado.name}</h2>
          <p><strong>Status:</strong> {personagemSelecionado.status}</p>
          <p><strong>Espécie:</strong> {personagemSelecionado.species}</p>
          <p><strong>Gênero:</strong> {personagemSelecionado.gender}</p>
          <p><strong>Origem:</strong> {personagemSelecionado.origin.name}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <h1>Lista de personagens</h1>
      <input
        type="text"
        placeholder='Digite nome ou ID'
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            buscarPersonagem()
          }
        }}
      />

      <button onClick={buscarPersonagem}>Buscar</button>
      <button onClick={chamarApi}>Lista completa</button>

      {carregando && <p>Carregando...</p>}

      <div className="card">
        {personagens.length === 0 && !carregando && (
          <p>Nenhum personagem encontrado.</p>
        )}

        {personagens.map(item => (
          <div
            key={item.id}
            className="personagem-card"
            onClick={() => mostrarDetalhes(item)}
            style={{ cursor: 'pointer' }}
          >
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
