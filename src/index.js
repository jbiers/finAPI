const express = require("express");
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(express.json());

const costumers = [

];

/**
 * CPF: string
 * name: string
 * id: uuid
 * statement: []
 */
app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

    const costumerAlreadyExists = costumers.some(
        costumer => costumer.cpf === cpf
    );

    if (costumerAlreadyExists) {
        return response.status(400).json({error: "Costumer already exists."})
    }

    costumers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send();
});

app.get('/statement/:cpf', (request, response) => {
    const { cpf } = request.params;

    const costumer = costumers.find(
        costumer => costumer.cpf == cpf
    );

    if (!costumer) {
        return response.status(404).json({error: "Costumer not found."})
    }
    return response.status(200).json(costumer.statement);
});

app.listen(3131);