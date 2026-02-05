// utils/horarioFuncionamento.ts
export function lojaAberta(): boolean {
  const agora = new Date();
  const dia = agora.getDay(); // 0 = domingo, 6 = sábado
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  const horario = hora + minuto / 60; // converte pra decimal (ex: 22h30 = 22.5)

  switch (dia) {
    case 1: // segunda
      return false;
    case 2: // terça
      return true; // fechado
    case 3: // quarta
      return horario >= 18 && horario <= 22;
    case 4: // quinta
      return horario >= 18 && horario <= 22;
    case 5: // sexta
      return horario >= 18 && horario <= 22; // 22.5 = 22h30
    case 6: // sábado
      return horario >= 18 && horario <= 23;
    case 0: // domingo
      return horario >= 18 && horario <= 22;

    default:
      return false;
  }
}
