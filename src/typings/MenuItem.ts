export default interface MenuItem {
  name: string;
  icon: string;
  to: {
    name: string;
    params: any;
  };
  children: MenuItem[];
}
