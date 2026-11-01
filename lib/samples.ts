import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from "xlsx";

// 示例数据：5 行员工录用信息。表头即模板占位符名。
export const SAMPLE_HEADERS = ["姓名", "岗位", "部门", "入职日期", "月薪"] as const;

export const SAMPLE_ROWS: Record<string, string>[] = [
  { 姓名: "张伟", 岗位: "产品经理", 部门: "产品部", 入职日期: "2026-11-10", 月薪: "18000" },
  { 姓名: "李娜", 岗位: "前端工程师", 部门: "技术部", 入职日期: "2026-11-12", 月薪: "16500" },
  { 姓名: "王强", 岗位: "运营专员", 部门: "运营部", 入职日期: "2026-11-15", 月薪: "12000" },
  { 姓名: "刘洋", 岗位: "数据分析师", 部门: "数据部", 入职日期: "2026-11-18", 月薪: "17000" },
  { 姓名: "陈静", 岗位: "人事专员", 部门: "人力资源部", 入职日期: "2026-11-20", 月薪: "11000" },
];

type AlignValue = (typeof AlignmentType)[keyof typeof AlignmentType];

const body = (text: string, opts?: { bold?: boolean; size?: number; align?: AlignValue }) =>
  new Paragraph({
    alignment: opts?.align,
    spacing: { after: 240, line: 360 },
    children: [new TextRun({ text, bold: opts?.bold, size: opts?.size ?? 24 })],
  });

// 用 docx 库现生成示例模板《录用通知书》，占位符与 SAMPLE_HEADERS 一一对应。
export function buildSampleTemplateDocument(): Document {
  return new Document({
    sections: [
      {
        children: [
          body("录用通知书", { bold: true, size: 36, align: AlignmentType.CENTER }),
          body("尊敬的 {{姓名}}："),
          body(
            "我们很高兴地通知您，您已通过公司的面试考核，被正式录用为 {{部门}} 的 {{岗位}} 一职。" +
              "请您于 {{入职日期}} 携带身份证、学历证明原件及复印件到公司人力资源部报到办理入职手续。" +
              "您的月薪为人民币 {{月薪}} 元，试用期与转正安排按公司制度及劳动合同约定执行。"
          ),
          body("期待与您共同成长，祝工作愉快！"),
          body("人力资源部", { align: AlignmentType.RIGHT }),
        ],
      },
    ],
  });
}

export async function sampleTemplateBlob(): Promise<Blob> {
  return Packer.toBlob(buildSampleTemplateDocument());
}

export async function sampleTemplateArrayBuffer(): Promise<ArrayBuffer> {
  return (await sampleTemplateBlob()).arrayBuffer();
}

// 用 xlsx 库现生成示例数据表。
export function sampleExcelArrayBuffer(): ArrayBuffer {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS, { header: [...SAMPLE_HEADERS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "员工名单");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return out;
}

export function sampleExcelBlob(): Blob {
  return new Blob([sampleExcelArrayBuffer()], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
