export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-card/30 backdrop-blur-sm py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">keyboard</span>
            <span>•</span>
            <span>Daily Typing Challenge</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>© {currentYear} All Rights Reserved</span>
          </div>
        </div>
        
        <div className="text-xs text-center text-muted-foreground mt-2">
          This game, its concept, design, and code are protected by copyright law.
        </div>
      </div>
    </footer>
  );
}
