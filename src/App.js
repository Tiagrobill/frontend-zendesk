const searchTicket = async () => {
    setLoading(true); // Inicia o loading
    try {
        let response;
        let params = { page: currentPage, limit: ticketsPerPage };
        const baseUrl = 'https://vercel.com/ti-agrobills-projects/back-up-zendesk/7DLSNUAvpSagoauDgZp1DrrmBWBt'; // URL do seu back-end na Vercel

        if (!isNaN(query) && query.trim() !== '' && parseInt(query) > 0) {
            response = await axios.get(`${baseUrl}/tickets/search/${query}`, { params });
        } else if (query.trim() !== '') {
            response = await axios.get(`${baseUrl}/tickets/search`, {
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
