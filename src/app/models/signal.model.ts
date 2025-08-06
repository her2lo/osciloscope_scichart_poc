export interface Signal {
  name: string;
  color: string;
  series?: any; // Using any for LCJS series type
  visible: boolean;
}