const { createClient } = require('@supabase/supabase-js');

// Coloque suas credenciais aqui para rodar este script UMA ÚNICA VEZ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'COLOQUE_AQUI_A_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'COLOQUE_AQUI_A_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

const employees = [
    // T1 (06:00-15:48) — 20 colaboradores
    { matricula: 'T1-01', name: 'Carlos da Silva', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-02', name: 'Roberto Almeida', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-03', name: 'Fernando Costa', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-04', name: 'Marcos Pereira', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-05', name: 'Paulo Oliveira', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-06', name: 'José Rodrigues', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-07', name: 'Antônio Souza', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-08', name: 'Luiz Fernandes', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-09', name: 'Ricardo Santos', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-10', name: 'Márcio Lima', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-11', name: 'Ana Beatriz Rocha', shift: 'T1', status: 'ativo', sex: 'F' },
    { matricula: 'T1-12', name: 'Juliana Mendes', shift: 'T1', status: 'ativo', sex: 'F' },
    { matricula: 'T1-13', name: 'Mariana Cardoso', shift: 'T1', status: 'ativo', sex: 'F' },
    { matricula: 'T1-14', name: 'Patrícia Nunes', shift: 'T1', status: 'ativo', sex: 'F' },
    { matricula: 'T1-15', name: 'Cláudia Araújo', shift: 'T1', status: 'ativo', sex: 'F' },
    { matricula: 'T1-16', name: 'Diego Carvalho', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-17', name: 'Thiago Barbosa', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-18', name: 'Renato Ferreira', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-19', name: 'André Moreira', shift: 'T1', status: 'ativo', sex: 'M' },
    { matricula: 'T1-20', name: 'Lucas Martins', shift: 'T1', status: 'ativo', sex: 'M' },

    // T2 (13:00-22:48) — 4 colaboradores
    { matricula: 'T2-01', name: 'Bruno Nascimento', shift: 'T2', status: 'ativo', sex: 'M' },
    { matricula: 'T2-02', name: 'Rafael Teixeira', shift: 'T2', status: 'ativo', sex: 'M' },
    { matricula: 'T2-03', name: 'Vanessa Ribeiro', shift: 'T2', status: 'ativo', sex: 'F' },
    { matricula: 'T2-04', name: 'Camila Gomes', shift: 'T2', status: 'ativo', sex: 'F' },

    // T3 (14:00-23:48) — 12 colaboradores
    { matricula: 'T3-01', name: 'Eduardo Vieira', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-02', name: 'Gustavo Monteiro', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-03', name: 'Leandro Dias', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-04', name: 'Felipe Machado', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-05', name: 'Daniel Pinto', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-06', name: 'Rodrigo Castro', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-07', name: 'Tatiana Lopes', shift: 'T3', status: 'ativo', sex: 'F' },
    { matricula: 'T3-08', name: 'Bianca Azevedo', shift: 'T3', status: 'ativo', sex: 'F' },
    { matricula: 'T3-09', name: 'Amanda Duarte', shift: 'T3', status: 'ativo', sex: 'F' },
    { matricula: 'T3-10', name: 'Fábio Correia', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-11', name: 'Sergio Cunha', shift: 'T3', status: 'ativo', sex: 'M' },
    { matricula: 'T3-12', name: 'Wagner Ramos', shift: 'T3', status: 'ativo', sex: 'M' },

    // T4 (22:00-06:35) — 4 colaboradores
    { matricula: 'T4-01', name: 'Henrique Borges', shift: 'T4', status: 'ativo', sex: 'M' },
    { matricula: 'T4-02', name: 'Jorge Freitas', shift: 'T4', status: 'ativo', sex: 'M' },
    { matricula: 'T4-03', name: 'Vinícius Moura', shift: 'T4', status: 'ativo', sex: 'M' },
    { matricula: 'T4-04', name: 'Robson Pires', shift: 'T4', status: 'ativo', sex: 'M' },

    // FÉRIAS — 3 colaboradores
    { matricula: 'FE-01', name: 'Michele Sampaio', shift: 'T1', status: 'ferias', sex: 'F' },
    { matricula: 'FE-02', name: 'Cristiano Batista', shift: 'T3', status: 'ferias', sex: 'M' },
    { matricula: 'FE-03', name: 'Leonardo Fonseca', shift: 'T1', status: 'ferias', sex: 'M' },
];

async function seedData() {
    console.log('Iniciando seed de banco de dados...');
    for (const emp of employees) {
        const { data, error } = await supabase.from('employees').upsert([emp], { onConflict: 'matricula' });
        if (error) {
            console.error(`Erro ao inserir ${emp.name}:`, error.message);
        } else {
            console.log(`Colaborador ${emp.name} inserido/atualizado!`);
        }
    }
    console.log('Seed completo!');
}

seedData();
