/**
 * ¿Este accesorio de la solicitud es un regalo?
 *
 * El backend marca `is_gift` solo en los regalos del COMBO (la fila cuelga de
 * un `combo_item`). El accesorio que regala un cupón (`free_accessory`) llega
 * sin esa marca y con cuota 0, y la confirmación lo pintaba «+S/0/mes» al lado
 * de otros regalos que decían «Regalo · Incluido».
 *
 * La cuota en 0 es la misma señal que usa el backend para decidir que un
 * accesorio no se cobra (`es_gratis` en `accessory_origin.marcar_origen`):
 * quien no paga cuota por el accesorio lo recibe de regalo, venga de donde
 * venga.
 */
export function accesorioEsRegalo(accesorio: {
  is_gift?: boolean | null;
  monthly_quota?: number | null;
}): boolean {
  if (accesorio.is_gift) return true;
  return !((accesorio.monthly_quota ?? 0) > 0);
}
