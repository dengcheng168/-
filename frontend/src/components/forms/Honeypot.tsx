/** 蜜罐字段：对真人用户隐藏，机器人脚本通常会自动填写文本输入框 */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]" tabIndex={-1}>
      <label htmlFor="website">Website</label>
      <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
