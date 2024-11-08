import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Importando o arquivo CSS

function App() {
    const [query, setQuery] = useState(''); // Armazenando a query de busca
    const [ticketData, setTicketData] = useState([]); // Armazenando os dados do ticket
    const [currentPage, setCurrentPage] = useState(1); // Página atual
    const [ticketsPerPage] = useState(5); // Número de tickets por página (ajustado para 5)
    const [totalTickets, setTotalTickets] = useState(0); // Total de tickets encontrados
    const [error, setError] = useState(null); // Armazenando erros de busca
    const [loading, setLoading] = useState(false); // Estado de loading
    const [currentTime, setCurrentTime] = useState(new Date()); // Hora atual

    // Atualiza a hora a cada segundo
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(interval);
    }, []);

    // Função para buscar o ticket
    const searchTicket = async () => {
        setLoading(true); // Inicia o loading
        try {
            let response;
            let params = { page: currentPage, limit: ticketsPerPage };

            if (!isNaN(query) && query.trim() !== '' && parseInt(query) > 0) {
                response = await axios.get(`http://localhost:3000/tickets/search/${query}`, { params });
            } else if (query.trim() !== '') {
                response = await axios.get(`http://localhost:3000/tickets/search`, {
                    params: { query, ...params }
                });
            } else {
                setError("Por favor, digite um termo de busca válido.");
                setTicketData([]);
                setLoading(false); // Termina o loading
                return;
            }

            if (response.data && response.data.length > 0) {
                setTicketData(response.data);
                setTotalTickets(response.data.length);
                setError(null);
            } else {
                setTicketData([]);
                setTotalTickets(0);
                setError("Nenhum resultado encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar ticket:", error);
            setTicketData([]);
            setTotalTickets(0);
            setError("Ocorreu um erro ao realizar a busca.");
        }
        setLoading(false); // Termina o loading
    };

    // Função para renderizar o conteúdo com quebras de linha e formatação de imagens
    const renderChatContent = (content) => {
        if (!content) {
            return <p>Nenhum conteúdo disponível</p>;
        }

        return content.split('\n').map((line, index) => {
            if (line.includes('![')) {
                const imageUrl = line.match(/!\[.*?\]\((.*?)\)/);
                if (imageUrl && imageUrl[1]) {
                    return (
                        <div key={index}>
                            <img
                                src={imageUrl[1]}
                                alt={`Imagem ${index}`}
                                className="image"
                            />
                            <a
                                href={imageUrl[1]}
                                download
                                className="download-button"
                            >
                                Baixar Imagem
                            </a>
                        </div>
                    );
                }
            }

            if (line.startsWith("http")) {
                return (
                    <a key={index} href={line} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-word' }}>
                        {line}
                    </a>
                );
            }

            return <p key={index}>{line}</p>;
        });
    };

    // Funções de navegação de página
    const nextPage = () => {
        if (currentPage * ticketsPerPage < totalTickets) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0); // Rolando para o topo da página
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0); // Rolando para o topo da página
        }
    };

    // Função para calcular a exibição da faixa de resultados
    const getResultsRange = () => {
        const start = (currentPage - 1) * ticketsPerPage + 1;
        const end = Math.min(currentPage * ticketsPerPage, totalTickets);
        return totalTickets > 0 ? `${start}-${end} de ${totalTickets}` : '0 resultados';
    };

    // Função para retornar à home de pesquisa
    const goHome = () => {
        setQuery('');
        setTicketData([]);
        setCurrentPage(1);
        setTotalTickets(0);
        setError(null);
    };

    // Função para obter a saudação com base na hora atual
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia!";
        if (hour < 18) return "Boa tarde!";
        return "Boa noite!";
    };

    // Função para obter a data formatada
    const getCurrentDate = () => {
        const date = new Date();
        return date.toLocaleDateString("pt-BR", {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // Função para formatar a hora
    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Busca de Tickets</h1>
            </header>

            <div className="search-box">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchTicket()} // Realiza a busca ao pressionar Enter
                    placeholder="Digite um número de ticket ou conteúdo"
                />
                <button onClick={searchTicket}>Procurar</button>
            </div>

            {loading && <div className="loading">Carregando...</div>}

            {error && <div className="no-results">{error}</div>}

            {ticketData.length > 0 && (
                <div>
                    <div className="home-button">
                        <button onClick={goHome}>Voltar à Home de Pesquisa</button>
                    </div>

                    <h3>Registros encontrados: {getResultsRange()}</h3>
                    <div>
                        {ticketData.map((ticket) => (
                            <div className="ticket" key={ticket.id}>
                                <h3>{ticket.title}</h3>
                                {renderChatContent(ticket.chat_content)}
                            </div>
                        ))}
                    </div>

                    <div className="pagination">
                        <button onClick={prevPage} disabled={currentPage === 1}>
                            Anterior
                        </button>
                        <span>{currentPage} de {Math.ceil(totalTickets / ticketsPerPage)}</span>
                        <button
                            onClick={nextPage}
                            disabled={currentPage * ticketsPerPage >= totalTickets}
                        >
                            Próximo
                        </button>
                    </div>
                </div>
            )}

            {/* Rodapé com data e hora */}
            <footer className="footer">
                <p>{getGreeting()}</p>
                <p>Hoje é dia {getCurrentDate()}</p>
                <p>Hora atual: {formatTime(currentTime)}</p>
            </footer>
        </div>
    );
}

export default App;
