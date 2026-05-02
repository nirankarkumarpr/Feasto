function PageHeader({ icon: Icon, badge, title, subtitle }) {
  return (
    <div className="mb-10 flex flex-col items-center justify-center">
      <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
        {Icon && <Icon className="inline-block mr-1 w-5 h-5" />}
        {badge}
      </span>
      
      <h2 className="text-3xl md:text-4xl px-4 font-bold text-gray-900 mt-2 text-center">
        {title}
      </h2>
    </div>
  );
}

export default PageHeader;
