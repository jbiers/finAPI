const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(express.json());

const costumers = [

];

// Middleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const costumer = costumers.find(costumer => costumer.cpf === cpf);

    if (!costumer) {
        return response.status(404).json({error: "Costumer not found."})
    }

    request.costumer = costumer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc += operation.amount;
        }

        return acc -= operation.amount;
    }, 0);

    return balance;
}

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

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;
    return response.status(200).json(costumer.statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;
    const { description, amount } = request.body;

    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        type: 'credit'
    };

    costumer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;
    const { description, amount } = request.body;

    const balance = getBalance(costumer.statement);

    if (balance < amount) {
        return response.status(400).json({"error": "Insufficient funds"})
    }

    const statementOperation = {
        amount,
        description,
        created_at: new Date(),
        type: 'debit'
    };

    costumer.statement.push(statementOperation);

    return response.status(201).send();
});

app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = costumer.statement.filter(operation => 
        operation.created_at.toDateString() === 
        new Date(dateFormat).toDateString()
    )

    return response.json(statement);
});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;
    const { name } = request.body;

    costumer.name = name;

    return response.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { costumer } = request;

    return response.status(200).json(costumer);
});

app.listen(3131);