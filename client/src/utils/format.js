export const formatPrice = (n = 0) => '₹' + Number(n).toLocaleString('en-IN');
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
