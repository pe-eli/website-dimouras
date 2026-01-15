// utils/horarioFuncionamento.ts
export function lojaAberta(): boolean {
  const agora = new Date();
  const dia = agora.getDay(); // 0 = domingo, 6 = sábado
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  const horario = hora + minuto / 60; // converte pra decimal (ex: 22h30 = 22.5)

  switch (dia) {
    case 1: // segunda
    case 2: // terça
      return false; // fechado

    case 3: // quarta
    case 4: // quinta
    case 5: // sexta
      return horario >= 18 && horario <= 22; // 22.5 = 22h30

    case 6: // sábado
    case 0: // domingo
      return horario >= 18 && horario <= 23;

    default:
      return false;
  }
}
